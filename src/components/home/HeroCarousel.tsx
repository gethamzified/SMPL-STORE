"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeroConfig {
    heading?: string;
    subheading?: string;
    ctaText?: string;
    ctaLink?: string;
}

interface HeroCarouselProps {
    products: any[];
    hero?: HeroConfig;
}

export function HeroCarousel({ products, hero }: HeroCarouselProps) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

    const scrollPrev = React.useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = React.useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = React.useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, [emblaApi]);

    React.useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);
    }, [emblaApi, setScrollSnaps, onSelect]);

    // Use first 5 products for carousel
    const featuredProducts = products.slice(0, 5);

    if (!featuredProducts.length) return null;

    const activeProduct = featuredProducts[selectedIndex];

    return (
        <div className="relative h-screen w-full overflow-hidden bg-transparent pt-24 md:pt-28">
            {/* 1. Static Background Layer */}
            <div className="absolute inset-0 z-0 pointer-events-none" />

            {/* 2. Sliding Images (Carousel) */}
            <div className="relative h-full w-full z-10 pointer-events-none" ref={emblaRef}>
                <div className="flex h-full pointer-events-auto">
                    {featuredProducts.map((product, index) => (
                        <div
                            key={product.id || index}
                            className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center will-change-transform"
                        >
                            <Link
                                href={`/product/${product.slug}`}
                                className="relative w-full h-[85vh] md:h-[70vh] max-w-none md:max-w-5xl cursor-pointer group/img transform-gpu -translate-y-8"
                            >
                                <Image
                                    src={product.cover_image || ''}
                                    alt={product.title}
                                    fill
                                    priority={index < 2}
                                    className="object-contain drop-shadow-[0_50px_60px_rgba(0,0,0,0.)] transition-transform duration-700 group-hover/img:scale-105 will-change-transform"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                                />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>


            {/* 4. Bottom Right: Price */}
            <div
                key={`cta-${selectedIndex}`}
                className="absolute bottom-24 right-6 md:right-12 text-right z-20 animate-in fade-in slide-in-from-right-8 duration-700"
            >
                <div className="mb-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40 block mb-1">
                        Current Value
                    </span>
                    <p className="text-3xl md:text-5xl font-black text-white mix-blend-mode-difference tracking-tighter">
                        {new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(activeProduct.price)}
                    </p>
                </div>
            </div>

            {/* Bottom Left: Specs */}
            <div
                key={`specs-${selectedIndex}`}
                className="absolute bottom-24 left-6 md:left-12 hidden md:flex flex-col gap-4 z-20 animate-in fade-in duration-1000"
            >
                <div className="text-[9px] font-black text-black/30 flex flex-col uppercase tracking-widest leading-relaxed max-w-[300px]">
                    <span>Item: {activeProduct.title}</span>
                    <span className="line-clamp-1 opacity-60 font-medium">{activeProduct.description || 'Premium SMPL© Studio Article'}</span>
                    <span>Status: {activeProduct.stock > 0 ? 'AVAILABLE' : 'SOLD_OUT'}</span>
                </div>
            </div>

            {/* Minimal Nav Controls */}
            <button
                onClick={scrollPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-all z-30 p-4 transform-gpu"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-8 h-8 md:w-12 md:h-12" />
            </button>

            <button
                onClick={scrollNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-all z-30 p-4 transform-gpu"
                aria-label="Next slide"
            >
                <ChevronRight className="w-8 h-8 md:w-12 md:h-12" />
            </button>

            {/* Bottom Counter */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 transform-gpu">
                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black text-black">0{selectedIndex + 1}</span>
                    <div className="w-20 h-[1px] bg-black/10 relative">
                        <div
                            className="absolute inset-y-0 left-0 bg-[#ff0000] transition-all duration-500 will-change-[width]"
                            style={{ width: `${((selectedIndex + 1) / featuredProducts.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-black text-black/20">0{featuredProducts.length}</span>
                </div>
            </div>
        </div>
    );
}
