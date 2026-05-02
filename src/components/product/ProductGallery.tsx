"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { cn } from "@/lib/utils";
import { Maximize2 } from "lucide-react";
import { ProductZoomImage } from "@/components/product/ProductZoomImage";
import { ProductLightbox } from "@/components/product/ProductLightbox";

interface ProductGalleryProps {
    images: string[];
    title: string;
    blurDataUrl?: string | null;
    blurDataUrls?: Record<string, string>;
}

// Helper to construct a Cloudinary-optimized preload URL
// (Bypasses /_next/image which doesn't work with custom loaders)
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ddk9lonhp';
const getOptimizedUrl = (src: string, width: number, quality: number) => {
    const transforms = `w_${width},c_limit,q_${quality},f_auto`;
    // Cloudinary upload URLs — strip existing transforms & re-apply
    if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
        const [base, rest] = src.split('/upload/');
        const segments = rest.split('/');
        let firstNonTransformIndex = 0;
        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            const isVersionString = /^v\d+$/.test(seg);
            const isTransform = !isVersionString && (seg.includes(',') || /^[a-z]{1,2}_/.test(seg));
            if (!isTransform) { firstNonTransformIndex = i; break; }
        }
        const path = segments.slice(firstNonTransformIndex).join('/');
        return `${base}/upload/${transforms}/${path}`;
    }
    // External URLs — route through Cloudinary Fetch API
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${transforms}/${encodeURI(src)}`;
};

export default function ProductGallery({ images, title, blurDataUrl, blurDataUrls }: ProductGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "center",
        containScroll: "trimSnaps",
        loop: true
    });
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const preloadedRef = useRef<Set<string>>(new Set());

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    // Sync Embla carousel selection
    useEffect(() => {
        if (!emblaApi) return;
        emblaApi.on("select", onSelect);
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi, onSelect]);

    // Smart Preloading: Only preload the next optimized image on desktop.
    // Hi-res zoom is handled on-demand by ProductZoomImage on hover.
    useEffect(() => {
        if (!images.length) return;

        // Skip preloading on mobile (no zoom, no benefit)
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;
        if (!isDesktop) return;

        // Preload the next image for smooth carousel transition
        const nextIndex = (selectedIndex + 1) % images.length;
        if (nextIndex !== selectedIndex) {
            const nextSrc = images[nextIndex];
            if (!preloadedRef.current.has(nextSrc)) {
                preloadedRef.current.add(nextSrc);
                const imgOptimized = new window.Image();
                imgOptimized.src = getOptimizedUrl(nextSrc, 1080, 80);
            }
        }
    }, [images, selectedIndex]);

    const scrollTo = (index: number) => {
        setSelectedIndex(index);
        if (emblaApi) emblaApi.scrollTo(index);
    };

    if (!images.length) return null;

    const getBlurUrl = (src: string, idx: number): string | null => {
        return blurDataUrls?.[src] || (idx === 0 ? blurDataUrl ?? null : null);
    };

    return (
        <>
            <div className="flex flex-col md:flex-row h-fit sticky top-20 md:top-24 w-full overflow-x-hidden bg-white z-10">
                {/* Desktop Thumbnails (Left Side - Compact) */}
                <div className="hidden md:flex flex-col w-16 lg:w-20 shrink-0 max-h-[70vh] overflow-y-auto no-scrollbar border-r-2 border-[#1a1a1a]">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => scrollTo(idx)}
                            className={cn(
                                "relative aspect-square w-full border-b-2 border-[#1a1a1a] overflow-hidden transition-all duration-0 p-0",
                                selectedIndex === idx
                                    ? "bg-[#1a1a1a] border-[#1a1a1a]"
                                    : "bg-white hover:bg-neutral-50"
                            )}
                        >
                            <div className="relative w-full h-full bg-white">
                                <Image
                                    src={`${img}?gravity=auto`}
                                    alt={`${title} view ${idx + 1}`}
                                    fill
                                    className="object-contain"
                                    sizes="80px"
                                    quality={75}
                                    placeholder={getBlurUrl(img, idx) ? "blur" : "empty"}
                                    blurDataURL={getBlurUrl(img, idx) ?? undefined}
                                />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Image Area */}
                <div className="relative w-full md:flex-1 min-w-0 aspect-[4/5] md:aspect-auto md:h-[70vh] bg-white overflow-hidden group">
                    {/* Mobile Carousel View */}
                    <div className="md:hidden h-full" ref={emblaRef}>
                        <div className="flex h-full touch-pan-y">
                            {images.map((img, idx) => (
                                <div
                                        className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center p-6"
                                        key={idx}
                                        onClick={() => {
                                            setSelectedIndex(idx);
                                            setLightboxOpen(true);
                                        }}
                                    >
                                        <Image
                                            src={`${img}?gravity=auto`}
                                            alt={`${title} - view ${idx + 1}`}
                                            fill
                                            className="object-contain"
                                            priority={idx === 0}
                                            sizes="(max-width: 768px) 100vw, 55vw"
                                            quality={80}
                                            placeholder={getBlurUrl(img, idx) ? "blur" : "empty"}
                                            blurDataURL={getBlurUrl(img, idx) ?? undefined}
                                        />
                                    </div>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Stacked Hi-Res Zoom Views */}
                    <div className="hidden md:block absolute inset-0 w-full h-full p-8 lg:p-12">
                        {images.map((img, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "absolute inset-0 w-full h-full transition-opacity duration-0 ease-in-out",
                                    selectedIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                                )}
                            >
                                <ProductZoomImage
                                    src={img}
                                    alt={title}
                                    blurDataUrl={getBlurUrl(img, idx)}
                                    priority={idx === 0}
                                    loading={idx === 0 ? undefined : (idx === selectedIndex ? "eager" : "lazy")}
                                    className="w-full h-full object-contain"
                                    onClick={() => setLightboxOpen(true)}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Expand button */}
                    <button
                        type="button"
                        onClick={() => setLightboxOpen(true)}
                        className="absolute bottom-3 right-3 z-20 w-8 h-8 bg-brand-ascent border-2 border-[#1a1a1a] flex items-center justify-center hover:bg-white hover:text-brand-ascent transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Open fullscreen view"
                    >
                        <Maximize2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Mobile Pagination Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 md:hidden pointer-events-none z-20">
                            {images.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "w-1 h-1 transition-all duration-300 border border-[#1a1a1a]/80",
                                        selectedIndex === idx ? "w-6 bg-black" : "opacity-60"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Lightbox — hi-res images with zoom, pan, navigation */}
            <ProductLightbox
                images={images}
                initialIndex={selectedIndex}
                alt={title}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />
        </>
    );
}
