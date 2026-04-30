/**
 * Server-side image processing pipeline using Sharp.
 * 
 * Responsibilities:
 * 1. Resize source images to a sane maximum (no 4000px originals in storage)
 * 2. Convert to WebP for optimal storage size (Next.js handles AVIF on delivery)
 * 3. Generate LQIP blurDataURL for instant placeholder rendering
 * 4. Strip metadata (EXIF, ICC profiles) to reduce size
 * 
 * Next.js `next/image` handles the final mile:
 *   - On-the-fly resize to exact viewport width (srcset from `sizes` prop)
 *   - AVIF/WebP content negotiation per browser Accept header
 *   - Edge caching with immutable TTL
 * 
 * So we do NOT generate 7 width variants here — that would be redundant.
 * We store ONE optimized source per image + its blurDataURL.
 */

import sharp from 'sharp';

// ─── Configuration ───────────────────────────────────────────────────────
export const IMAGE_CONFIG = {
  /** Max width for product/collection images stored in Supabase */
  PRODUCT_MAX_WIDTH: 2500,
  /** Max width for hero/full-bleed images */
  HERO_MAX_WIDTH: 2560,
  /** Max width for thumbnails / card images */
  CARD_MAX_WIDTH: 1200,
  /** WebP quality for stored source images (Next.js re-encodes on delivery) */
  WEBP_QUALITY: 80,
  /** LQIP blur placeholder width (tiny — base64 encoded inline) */
  BLUR_WIDTH: 20,
  /** LQIP blur JPEG quality */
  BLUR_QUALITY: 40,
  /** Max file size we accept server-side (12 MB) */
  MAX_FILE_SIZE: 12 * 1024 * 1024,
} as const;

// ─── Types ───────────────────────────────────────────────────────────────
export interface ProcessedImage {
  /** Optimized image buffer ready for upload */
  buffer: Buffer;
  /** MIME type of the processed image */
  contentType: string;
  /** File extension (without dot) */
  extension: string;
  /** Width after processing */
  width: number;
  /** Height after processing */
  height: number;
  /** Original file size in bytes */
  originalSize: number;
  /** Processed file size in bytes */
  processedSize: number;
  /** Base64 LQIP blur data URL for next/image placeholder="blur" */
  blurDataURL: string;
}

export type ImageCategory = 'product' | 'hero' | 'card' | 'collection';

// ─── Core Processing ─────────────────────────────────────────────────────

/**
 * Process a raw image file through the Sharp pipeline.
 * Returns an optimized WebP buffer + blurDataURL.
 *
 * @param input - Raw image Buffer or File
 * @param category - Determines max width ('product' | 'hero' | 'card' | 'collection')
 */
export async function processImage(
  input: Buffer | File,
  category: ImageCategory = 'product'
): Promise<ProcessedImage> {
  // Convert File to Buffer if needed
  let inputBuffer: Buffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    // Cast to unknown then Blob to satisfy TS with File | Buffer union
    const inputAsBlob = input as unknown as Blob;
    const arrayBuf = await inputAsBlob.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuf);
  }

  const originalSize = inputBuffer.length;

  // Determine max width based on category
  const maxWidth = getMaxWidth(category);

  // Step 1: Read metadata to understand the source
  const metadata = await sharp(inputBuffer).metadata();

  // Step 2: Resize + convert to WebP + strip metadata
  const pipeline = sharp(inputBuffer)
    .rotate() // Auto-rotate based on EXIF orientation, then strip EXIF
    .resize({
      width: maxWidth,
      withoutEnlargement: true, // Never upscale
      fit: 'inside',           // Maintain aspect ratio
    })
    .webp({
      quality: IMAGE_CONFIG.WEBP_QUALITY,
      effort: 4,      // Balance between speed and compression (0-6)
      smartSubsample: true,
    })
    .withMetadata({ orientation: undefined }); // Strip all metadata

  const processedBuffer = await pipeline.toBuffer();

  // Step 3: Get processed dimensions
  const processedMeta = await sharp(processedBuffer).metadata();

  // Step 4: Generate LQIP blurDataURL
  const blurDataURL = await generateBlurDataURL(inputBuffer);

  return {
    buffer: processedBuffer,
    contentType: 'image/webp',
    extension: 'webp',
    width: processedMeta.width ?? metadata.width ?? 0,
    height: processedMeta.height ?? metadata.height ?? 0,
    originalSize,
    processedSize: processedBuffer.length,
    blurDataURL,
  };
}

/**
 * Generate a tiny LQIP (Low Quality Image Placeholder) as a base64 data URL.
 * This is the blurDataURL that next/image uses for placeholder="blur".
 * 
 * Produces a ~300-500 byte base64 string that renders as a blurred preview.
 */
export async function generateBlurDataURL(input: Buffer | File): Promise<string> {
  let inputBuffer: Buffer;
  if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    // Cast to unknown then Blob to satisfy TS with File | Buffer union
    const inputAsBlob = input as unknown as Blob;
    const arrayBuf = await inputAsBlob.arrayBuffer();
    inputBuffer = Buffer.from(arrayBuf);
  }

  const blurBuffer = await sharp(inputBuffer)
    .resize(IMAGE_CONFIG.BLUR_WIDTH)
    .blur(2)
    .jpeg({ quality: IMAGE_CONFIG.BLUR_QUALITY, progressive: false })
    .toBuffer();

  return `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
}

/**
 * Generate a blurDataURL from an existing image URL.
 * Useful for backfilling blur placeholders for existing images.
 */
export async function generateBlurFromURL(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return generateBlurDataURL(buffer);
}

/**
 * Process multiple images in parallel with concurrency control.
 */
export async function processImages(
  files: File[],
  category: ImageCategory = 'product',
  concurrency = 3
): Promise<ProcessedImage[]> {
  const results: ProcessedImage[] = [];

  // Process in batches to avoid memory spikes
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(file => processImage(file, category))
    );
    results.push(...batchResults);
  }

  return results;
}


// ─── Helpers ─────────────────────────────────────────────────────────────

function getMaxWidth(category: ImageCategory): number {
  switch (category) {
    case 'hero':
      return IMAGE_CONFIG.HERO_MAX_WIDTH;
    case 'card':
      return IMAGE_CONFIG.CARD_MAX_WIDTH;
    case 'collection':
      return IMAGE_CONFIG.PRODUCT_MAX_WIDTH;
    case 'product':
    default:
      return IMAGE_CONFIG.PRODUCT_MAX_WIDTH;
  }
}

/**
 * Generate a versioned filename for CDN-safe caching.
 * Pattern: {prefix}/{slug}-{timestamp}-v{version}.webp
 *
 * Using timestamp as version ensures:
 * - Unique filenames on every upload (safe with immutable cache headers)
 * - No cache invalidation needed — new upload = new URL
 */
export function generateImageFilename(
  prefix: string,
  slug?: string,
): string {
  const ts = Date.now();
  const rand = Math.random().toString(36).substring(2, 10);
  const base = slug
    ? `${slug}-${ts}-${rand}`
    : `${ts}-${rand}`;
  return `${prefix}/${base}.webp`;
}
