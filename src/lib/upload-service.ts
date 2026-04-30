/**
 * Client-side upload service with background upload, progress tracking,
 * concurrency limiting, and cancellation support.
 *
 * Design goals:
 * - No large buffers stored in React state
 * - Object URLs revoked on deletion / unmount
 * - Concurrent upload limit (default 3) to prevent memory spikes
 * - Per-image progress, error, and cancellation
 * - Integrates with server-side Sharp processing via API route
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';

export interface UploadedImage {
  /** Client-side unique ID */
  id: string;
  /** Object URL for instant preview (revoke on cleanup!) */
  previewUrl: string;
  /** Remote URL after successful upload */
  remoteUrl: string | null;
  /** LQIP blur data URL from server processing */
  blurDataUrl: string | null;
  /** Upload progress 0–100 */
  progress: number;
  /** Current status */
  status: UploadStatus;
  /** Error message if failed */
  error: string | null;
  /** Original file name */
  fileName: string;
  /** Original file size in bytes */
  fileSize: number;
  /** Whether this image already existed (edit mode) */
  isExisting: boolean;
  /** The raw File reference — only kept while upload is pending/in-progress */
  _file: File | null;
  /** AbortController for cancelling in-flight upload */
  _abortController: AbortController | null;
}

export interface UploadResult {
  url: string;
  blurDataUrl: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

// ─── ID Generation ───────────────────────────────────────────────────────

let counter = 0;
export function generateUploadId(): string {
  return `img_${Date.now()}_${++counter}_${Math.random().toString(36).slice(2, 8)}`;
}

// ─── Upload Queue ────────────────────────────────────────────────────────

type UploadTask = {
  image: UploadedImage;
  onProgress: (id: string, progress: number) => void;
  onSuccess: (id: string, result: UploadResult) => void;
  onError: (id: string, error: string) => void;
  onStatusChange: (id: string, status: UploadStatus) => void;
};

class UploadQueue {
  private queue: UploadTask[] = [];
  private active = 0;
  private maxConcurrent: number;

  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue(task: UploadTask) {
    this.queue.push(task);
    this.processNext();
  }

  cancel(id: string) {
    // Remove from queue if not yet started
    this.queue = this.queue.filter(t => t.image.id !== id);
  }

  private async processNext() {
    if (this.active >= this.maxConcurrent || this.queue.length === 0) return;

    const task = this.queue.shift()!;
    this.active++;

    try {
      await this.executeUpload(task);
    } finally {
      this.active--;
      this.processNext();
    }
  }

  private async executeUpload(task: UploadTask) {
    const { image, onProgress, onSuccess, onError, onStatusChange } = task;

    // File may have been cleared if cancelled before starting
    if (!image._file) {
      onStatusChange(image.id, 'cancelled');
      return;
    }

    const controller = new AbortController();
    image._abortController = controller;
    onStatusChange(image.id, 'uploading');

    try {
      const result = await uploadFileWithProgress(
        image._file,
        controller.signal,
        (progress) => onProgress(image.id, progress)
      );

      if (controller.signal.aborted) {
        onStatusChange(image.id, 'cancelled');
        return;
      }

      onSuccess(image.id, result);
    } catch (err) {
      if (controller.signal.aborted) {
        onStatusChange(image.id, 'cancelled');
        return;
      }
      const message = err instanceof Error ? err.message : 'Upload failed';
      onError(image.id, message);
    }
  }
}

// ─── Singleton upload queue ──────────────────────────────────────────────

let _queue: UploadQueue | null = null;

export function getUploadQueue(maxConcurrent = 3): UploadQueue {
  if (!_queue) {
    _queue = new UploadQueue(maxConcurrent);
  }
  return _queue;
}

// ─── Core upload function with XHR for progress ─────────────────────────

import { optimizeImage, type OptimizeResult } from '@/app/actions/optimize-image';
import { createClient } from '@/lib/supabase/client';

// ─── Direct Upload + Server Optimization ─────────────────────────────────

async function uploadFileWithProgress(
  file: File,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<UploadResult> {
  const supabase = createClient();

  // 1. Generate unique filename for raw upload
  // format: raw/{timestamp}-{random}.{ext}
  const fileExt = file.name.split('.').pop();
  const rawFileName = `raw/${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

  // 2. Simulate Upload Progress (Supabase JS SDK doesn't expose progress events easily yet)
  // We split progress: 0-50% = Uploading, 50-90% = Processing, 100% = Done
  let progress = 0;
  const progressInterval = setInterval(() => {
    if (progress < 50) progress += 5; // Uploading phase
    else if (progress < 90) progress += 1; // Processing phase (slower)

    if (progress > 90) progress = 90;
    onProgress(progress);
  }, 200);

  try {
    // 3. Upload Raw File directly to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('products')
      .upload(rawFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Jump to 50% (Upload done, starting optimization)
    progress = 50;
    onProgress(50);

    // Checks for abort before potentially expensive server action
    if (signal.aborted) throw new DOMException('Upload cancelled', 'AbortError');

    // 4. Trigger Server-Side Optimization
    // This action downloads the raw file, processes it, saves optimized version, and deletes raw.
    const result: OptimizeResult = await optimizeImage(rawFileName);

    if (result.error) throw new Error(result.error);
    if (!result.data) throw new Error('No data returned from optimization');

    // Finish
    clearInterval(progressInterval);
    onProgress(100);
    return result.data;

  } catch (err) {
    clearInterval(progressInterval);

    // Try to cleanup raw file if optimization failed (best effort)
    // We can fire-and-forget this cleanup
    if (err instanceof Error && !err.message.includes('Upload failed')) {
      supabase.storage.from('products').remove([rawFileName]).then(({ error }) => {
        if (error) console.error('Failed to cleanup raw file:', error);
      });
    }

    if (err instanceof Error && err.name === 'AbortError') {
      throw new DOMException('Upload cancelled', 'AbortError');
    }

    console.error('Upload pipeline failed:', err);
    throw new Error(err instanceof Error ? err.message : 'Upload failed');
  }
}

// ─── Delete uploaded image from storage ──────────────────────────────────

import { deleteImage } from '@/app/actions/delete-image';

export async function deleteUploadedImage(remoteUrl: string): Promise<boolean> {
  const result = await deleteImage(remoteUrl);
  if (!result.success) {
    console.error('Failed to delete uploaded image:', result.error);
  }
  return result.success;
}

// ─── Preview URL management ──────────────────────────────────────────────

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}

export function revokePreviewUrl(url: string) {
  // Only revoke blob: URLs, not remote URLs
  if (url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // Silently ignore if already revoked
    }
  }
}

// ─── File validation ─────────────────────────────────────────────────────

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB
const MAX_IMAGES = 10;

export interface FileValidationResult {
  valid: File[];
  errors: string[];
}

export function validateFiles(
  files: File[],
  currentCount: number,
  maxImages = MAX_IMAGES,
  maxSize = MAX_FILE_SIZE
): FileValidationResult {
  const errors: string[] = [];
  const remainingSlots = maxImages - currentCount;

  if (remainingSlots <= 0) {
    errors.push(`Maximum ${maxImages} images allowed`);
    return { valid: [], errors };
  }

  const sliced = files.slice(0, remainingSlots);
  if (files.length > remainingSlots) {
    errors.push(`Only ${remainingSlots} more image${remainingSlots > 1 ? 's' : ''} can be added`);
  }

  const valid: File[] = [];
  for (const file of sliced) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(`"${file.name}" is not a supported format (JPEG, PNG, WebP)`);
      continue;
    }
    if (file.size > maxSize) {
      errors.push(`"${file.name}" exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`);
      continue;
    }
    valid.push(file);
  }

  return { valid, errors };
}
