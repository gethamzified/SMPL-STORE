/**
 * ProductZoomImage — High-resolution zoom component for product images.
 *
 * How it works (Shopify / Amazon pattern):
 *
 * 1. **Default state**: Shows a responsive image via next/image with appropriate
 *    srcset sizes for the viewport (e.g. ~700px for the gallery column).
 *    Next.js serves an optimized, smaller variant from its image cache.
 *
 * 2. **Hover zoom**: When the user hovers, we render a SECOND <img> element
 *    that loads the full-resolution master image (2500px WebP stored in Supabase).
 *    This second image is positioned absolutely, scaled 2.5×, and its transform-origin
 *    follows the cursor — creating a loupe/magnifier effect with sharp detail.
 *
 * 3. **Why two images?**: The base next/image is optimized for fast initial load
 *    (~700px wide). The zoom image loads the full 2500px master on demand.
 *    This means:
 *    - Page loads fast (small images)
 *    - Zoom is sharp (loads hi-res only when needed)
 *    - No quality loss — the hi-res image is the actual stored master
 *
 * 4. **Preloading**: On hover intent (pointer enters), we start loading the hi-res
 *    image. By the time the user is actively zooming, it's usually cached.
 *
 * 5. **Mobile**: No hover zoom — tap opens fullscreen lightbox instead.
 */

'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProductZoomImageProps {
  /** Image URL (Supabase public URL to the 2500px WebP master) */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** LQIP blur data URL for placeholder */
  blurDataUrl?: string | null;
  /** Whether this is the priority (LCP) image */
  priority?: boolean;
  /** Image loading behavior */
  loading?: "eager" | "lazy";
  /** CSS class for the container */
  className?: string;
  /** Callback when user clicks (e.g. to open lightbox) */
  onClick?: () => void;
}

export function ProductZoomImage({
  src,
  alt,
  blurDataUrl,
  priority = false,
  loading,
  className,
  onClick,
}: ProductZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        className,
      )}
      onClick={onClick}
    >
      {/* Base image — optimized by Next.js for fast loading */}
      <Image
        src={`${src}?gravity=auto`}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 700px"
        quality={80}
        priority={priority}
        loading={loading}
        placeholder={blurDataUrl ? 'blur' : 'empty'}
        blurDataURL={blurDataUrl || undefined}
      />
    </div>
  );
}
