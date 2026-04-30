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

// ─── Direct Upload + Server Optimization ─────────────────────────────────

async function uploadFileWithProgress(
  file: File,
  signal: AbortSignal,
  onProgress: (progress: number) => void,
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      return reject(new Error('Cloudinary environment variables are missing'));
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'products'); // Optional: organize uploads into a folder

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        
        // Map Cloudinary response to our expected UploadResult
        // Cloudinary handles optimization automatically based on delivery URL parameters,
        // but since we need a blurDataUrl, we can generate a low-quality placeholder URL.
        const blurDataUrl = response.secure_url.replace('/upload/', '/upload/w_10,e_blur:1000,f_auto,q_auto/');
        
        resolve({
          url: response.secure_url,
          blurDataUrl: blurDataUrl,
          width: response.width,
          height: response.height,
          originalSize: response.bytes,
          processedSize: response.bytes // Cloudinary transforms on the fly
        });
      } else {
        const errorMsg = xhr.responseText ? JSON.parse(xhr.responseText).error?.message : 'Unknown error';
        reject(new Error(`Upload failed: ${errorMsg}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed due to network error'));
    
    // Wire up cancellation
    signal.addEventListener('abort', () => {
      xhr.abort();
      reject(new DOMException('Upload cancelled', 'AbortError'));
    });

    xhr.send(formData);
  });
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
