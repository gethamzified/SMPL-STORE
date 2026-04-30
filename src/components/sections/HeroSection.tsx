"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
// Reliable default image (external CDN, always available)
const DEFAULT_HERO_IMAGE = "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg";

type HeroSectionProps = {
  heading?: string;
  subheading?: string;
  image?: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  brandName?: string;
  overlayOpacity?: number;
  blurDataURL?: string;
  variant?: "full" | "poster";
  showCopy?: boolean;
};

/**
 * HeroSection - Client Component
 * 
 * Strategy:
 * 1. Image is visible immediately via CSS (no opacity-0 until JS loads).
 * 2. onLoad triggers an entrance animation as a progressive enhancement.
 * 3. Without JS, the image is still fully visible (no black box).
 */
const HeroSection = ({
  heading,
  subheading,
  image,
  mobileImage,
  brandName = "SMPL",
  overlayOpacity = 0.3,
  ctaText,
  ctaLink,
  blurDataURL,
  variant = "full",
  showCopy = true,
}: HeroSectionProps) => {
  const [isDesktopLoaded, setIsDesktopLoaded] = useState(false);
  const [isMobileLoaded, setIsMobileLoaded] = useState(false);

  // Legacy single image mode
  const displayHeading = heading || brandName;
  const effectiveImage = image?.trim() || DEFAULT_HERO_IMAGE;
  const effectiveMobileImage = mobileImage?.trim();
  const hasMobileImage = !!effectiveMobileImage;

  const isLoaded = isDesktopLoaded || isMobileLoaded;

  const isPoster = variant === "poster";

  return (
    <section className={isPoster ? "relative w-full overflow-hidden bg-background aspect-[16/9] md:aspect-[21/7]" : "relative w-full min-h-[100svh] overflow-hidden bg-background"}>
      <div className="absolute inset-0 h-full w-full bg-black">
        {/* Desktop Image (or default if no mobile image) */}
        <div className={`absolute inset-0 h-full w-full ${hasMobileImage ? 'hidden md:block' : ''} ${isDesktopLoaded ? 'animate-image-entrance' : ''}`}>
          {/* Responsive images handled via Next.js Image sizes/priority */}
          <Image
            src={effectiveImage}
            alt={displayHeading || "Hero Image"}
            fill
            priority
            fetchPriority="high"
            quality={isPoster ? 85 : 75}
            sizes="100vw"
            className={isPoster ? "object-cover object-center" : "object-cover object-center"}
            placeholder={blurDataURL ? "blur" : "empty"}
            blurDataURL={blurDataURL}
            onLoad={() => setIsDesktopLoaded(true)}
          />
        </div>

        {/* Mobile Image (if provided) */}
        {hasMobileImage && (
          <div className={`absolute inset-0 h-full w-full md:hidden ${isMobileLoaded ? 'animate-image-entrance' : ''}`}>
            <Image
              src={effectiveMobileImage}
              alt={displayHeading || "Hero Image"}
              fill
              priority
              fetchPriority="high"
              quality={isPoster ? 85 : 75}
              sizes="100vw"
              className="object-cover object-center"
              placeholder={blurDataURL ? "blur" : "empty"}
              blurDataURL={blurDataURL}
              onLoad={() => setIsMobileLoaded(true)}
            />
          </div>
        )}

        {/* CSS-only Overlay (Instant paint) */}
        {!isPoster && (
          <>
            <div
              className="absolute inset-0 bg-black z-[5]"
              style={{ opacity: overlayOpacity }}
            />

            {/* Editorial gradient to improve text contrast on mobile */}
            <div className="absolute inset-0 z-[6] bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
          </>
        )}
      </div>

      {/* Content Container - CSS Animated for zero hydration cost */}
      {showCopy && !isPoster && (
        <div className={`relative z-10 max-w-[1920px] mx-auto w-full min-h-[100svh] flex items-end px-6 md:px-10 ${isLoaded ? 'is-visible' : ''}`}>
          <div className="w-full pb-14 md:pb-24 safe-area-bottom">
            <p className="hero-subtext text-white/80 text-[10px] md:text-xs tracking-[0.28em] uppercase font-semibold">
              {subheading || "SPRING/SUMMER '26"}
            </p>

            <h1 className="hero-text text-white text-5xl sm:text-6xl md:text-8xl font-semibold tracking-tight uppercase text-balance">
              {displayHeading}
            </h1>

            <div className="hero-cta pt-6">
              <Link
                href={ctaLink || "/shop"}
                className="inline-flex items-center justify-center px-7 py-3 bg-white text-black border border-white/30 text-[10px] md:text-xs font-semibold tracking-[0.22em] hover:bg-transparent hover:text-white transition-colors duration-300 uppercase"
              >
                {ctaText || "Shop Now"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
