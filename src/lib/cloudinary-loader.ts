/**
 * Cloudinary Image Loader for Next.js
 * 
 * Strategy:
 * 1. Cloudinary URLs → Strip existing transforms, apply fresh optimized ones
 * 2. Supabase/External URLs → Route through Cloudinary Fetch API for CDN + optimization
 * 3. Local URLs → Pass through with width query param (for SVGs, favicons, etc.)
 * 
 * Optimization stack:
 * - f_auto: Auto-negotiate format (AVIF > WebP > JPEG based on browser)
 * - q_auto: Perceptual quality optimization (Cloudinary's ML-based)
 * - w_{width}: Responsive width matching Next.js deviceSizes/imageSizes
 * - c_limit: Never upscale, only downscale
 * - dpr_auto: Serve 2x for retina displays automatically
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddk9lonhp';

/**
 * Build a clean Cloudinary transformation string
 */
function buildTransforms(width: number, quality?: number, gravity?: string): string {
  const transforms = [
    `w_${width}`,
    gravity ? 'c_fill' : 'c_limit', // Use fill if gravity is specified, otherwise limit
    `q_${quality || 'auto'}`,
    'f_auto',         // AVIF/WebP auto-negotiation
  ];

  if (gravity) {
    transforms.push(`g_${gravity}`);
  }

  return transforms.join(',');
}

/**
 * For Cloudinary upload URLs, strip ALL transformation segments
 * and return just the base + clean asset path.
 * 
 * Input:  https://res.cloudinary.com/cloud/image/upload/f_auto,q_auto/v123/folder/image.png
 * Output: { base: "https://res.cloudinary.com/cloud/image/upload", path: "v123/folder/image.png" }
 */
function parseCloudinaryUrl(url: string): { base: string; path: string } | null {
  const uploadSplit = url.split('/upload/');
  if (uploadSplit.length !== 2) return null;

  const base = uploadSplit[0] + '/upload';
  const segments = uploadSplit[1].split('/');

  // Walk segments until we find a non-transform one
  // Transforms look like: "f_auto", "w_500,c_limit,q_auto", "g_auto", "e_blur:1000"
  // Non-transforms: version strings "v1234567890", folder names, filenames
  let firstNonTransformIndex = 0;
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    // A segment is a transform if it:
    // - Contains a comma (multi-param transform like "w_500,c_limit")
    // - Matches the pattern letter(s)_value (like "f_auto", "q_80", "w_1920", "e_blur:1000")
    // - Is NOT a version string (v followed by digits)
    const isVersionString = /^v\d+$/.test(seg);
    const isTransform = !isVersionString && (seg.includes(',') || /^[a-z]{1,2}_/.test(seg));
    
    if (!isTransform) {
      firstNonTransformIndex = i;
      break;
    }
  }

  const path = segments.slice(firstNonTransformIndex).join('/');
  return { base, path };
}

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Check for gravity in query string (e.g. ?gravity=auto)
  let gravity: string | undefined;
  let cleanSrc = src;

  if (src.includes('?')) {
    const [url, query] = src.split('?');
    const params = new URLSearchParams(query);
    if (params.has('gravity')) {
      gravity = params.get('gravity') || undefined;
      params.delete('gravity');
      const newQuery = params.toString();
      cleanSrc = newQuery ? `${url}?${newQuery}` : url;
    }
  }

  const transforms = buildTransforms(width, quality, gravity);

  // ── 1. Cloudinary Upload URLs ─────────────────────────────────────────
  // Already hosted on Cloudinary — just swap/inject transforms
  if (cleanSrc.includes('res.cloudinary.com') && cleanSrc.includes('/upload/')) {
    const parsed = parseCloudinaryUrl(cleanSrc);
    if (parsed) {
      return `${parsed.base}/${transforms}/${parsed.path}`;
    }
    // Fallback: just inject after /upload/
    return cleanSrc.replace('/upload/', `/upload/${transforms}/`);
  }

  // ── 2. Cloudinary Fetch URLs ──────────────────────────────────────────
  // Already a fetch URL — return as-is (already optimized)
  if (cleanSrc.includes('res.cloudinary.com') && cleanSrc.includes('/fetch/')) {
    return cleanSrc;
  }

  // ── 3. Local/Static Assets ────────────────────────────────────────────
  // SVGs, favicons, local images — pass through, just satisfy the width contract
  if (cleanSrc.startsWith('/') || cleanSrc.startsWith('data:')) {
    const connector = cleanSrc.includes('?') ? '&' : '?';
    return `${cleanSrc}${connector}w=${width}`;
  }

  // ── 4. External URLs (Supabase Storage, Unsplash, Pexels, etc.) ──────
  // Route through Cloudinary's Fetch API for CDN delivery + auto optimization
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms}/${encodeURI(cleanSrc)}`;
}
