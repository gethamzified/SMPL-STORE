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

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  /** Zoom magnification level (default: 2.5) */
  zoomScale?: number;
  /** CSS class for the container */
  className?: string;
  /** Callback when user clicks (e.g. to open lightbox) */
  onClick?: () => void;
}

/**
 * Build the full-resolution URL for zoom.
 * 
 * If using Next.js image optimization, the default `<Image>` tag
 * serves a resized version. For zoom, we want the original master.
 * 
 * Supabase URLs are already direct — no transformation needed.
 * But if Next.js rewrites through /_next/image, we bypass it
 * by using the raw URL directly in an <img> tag.
 */
function getHiResUrl(src: string): string {
  // Already a direct Supabase/CDN URL — use as-is
  return src;
}

export function ProductZoomImage({
  src,
  alt,
  blurDataUrl,
  priority = false,
  loading,
  zoomScale = 2.5,
  className,
  onClick,
}: ProductZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isHiResLoaded, setIsHiResLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const hiResRef = useRef<HTMLImageElement | null>(null);

  // ─── Preload hi-res image on hover intent ─────────────────────────────
  const hiResUrl = getHiResUrl(src);

  // Preload when user shows intent (pointerenter)
  const preloadHiRes = useCallback(() => {
    if (hiResRef.current) return; // Already loaded/loading

    const img = new window.Image();
    img.src = hiResUrl;
    img.onload = () => setIsHiResLoaded(true);
    hiResRef.current = img;
  }, [hiResUrl]);

  // Reset hi-res state when src changes (user switches images)
  useEffect(() => {
    setIsHiResLoaded(false);
    hiResRef.current = null;
  }, [src]);

  // ─── Mouse tracking ───────────────────────────────────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  }, []);

  const handleMouseEnter = useCallback(() => {
    preloadHiRes();
    setIsHovering(true);
  }, [preloadHiRes]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const showZoom = isHovering && isHiResLoaded;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden cursor-zoom-in',
        showZoom && 'cursor-crosshair',
        className,
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      {/* Base image — optimized by Next.js for fast loading */}
      <Image
        src={src}
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

      {/* Hi-res zoom layer — the full 2500px master image */}
      {showZoom && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={hiResUrl}
            alt=""
            className="absolute top-0 left-0 w-full h-full object-cover will-change-transform"
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              // Smooth sub-pixel rendering for crisp zoom
              imageRendering: 'auto',
            }}
            draggable={false}
          />
        </div>
      )}

      {/* Loading indicator while hi-res is being fetched */}
      {isHovering && !isHiResLoaded && (
        <div className="absolute top-3 right-3 z-20 pointer-events-none">
          <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
        </div>
      )}

      {/* Zoom hint badge */}
      {!isHovering && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 text-[10px] uppercase font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none text-black z-20">
          Hover to Zoom
        </div>
      )}
    </div>
  );
}
