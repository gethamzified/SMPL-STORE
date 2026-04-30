"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

// Default fallback images from public folder
const DEFAULT_IMAGES = {
    hero: "/images/featured/Highfashion_studio_portrait_2k_202601310016.jpeg",
    topRight: "/images/featured/Highfashion_studio_portrait_2k_202601310026.jpeg",
    bottomRight: "/images/featured/Dramatic_cinematic_studio_2k_202601211907.jpeg",
};

interface FeaturingProps {
    /** Product images to use instead of defaults. Falls back to static images if not provided. */
    images?: string[];
    /** Blur data URLs keyed by image URL for instant placeholders. */
    blurDataUrls?: Record<string, string>;
}

export default function Featuring({ images, blurDataUrls }: FeaturingProps) {
    // Use product images if provided, otherwise use defaults
    const heroImage = images?.[0] || DEFAULT_IMAGES.hero;
    const topRightImage = images?.[1] || DEFAULT_IMAGES.topRight;
    const bottomRightImage = images?.[2] || DEFAULT_IMAGES.bottomRight;

    const { ref: heroRef, isVisible: isHeroVisible } = useScrollReveal({ threshold: 0.2 });
    const { ref: topRef, isVisible: isTopVisible } = useScrollReveal({ threshold: 0.2 });
    const { ref: bottomRef, isVisible: isBottomVisible } = useScrollReveal({ threshold: 0.2 });

    return (
        <section className="w-full min-h-screen flex flex-col lg:flex-row font-sans bg-black overflow-hidden">

            {/* LEFT COLUMN: HERO */}
            <div className="lg:w-1/2 relative min-h-[90svh] lg:h-screen flex flex-col justify-between p-8 md:p-10 lg:p-14 overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt="SMPL Model"
                        fill
                        className="object-cover object-center opacity-100"
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={80}
                        placeholder={blurDataUrls?.[heroImage] ? "blur" : "empty"}
                        blurDataURL={blurDataUrls?.[heroImage]}
                    />
                </div>

                <div className="relative flex flex-col justify-between h-full">
                    <div className="flex flex-col items-start gap-4 pt-4 pointer-events-auto">
                        <div className="flex items-center gap-3 text-[10px] font-bold tracking-widest uppercase text-neutral-800">
                            <span>DROP</span>
                            <span className="text-neutral-400">//</span>
                            <span>S/S 2026</span>
                        </div>
                        <div className="bg-black text-white px-3 py-1 text-[11px] font-black tracking-wider uppercase inline-block">
                            SMPL — Standard
                        </div>
                    </div>

                    <div className="mt-auto mb-12 lg:mb-24 relative" ref={heroRef}>
                        <h1 className="text-[clamp(3rem,11vw,7.5rem)] font-black text-white leading-[0.8] tracking-tighter uppercase">
                            <span className="block overflow-hidden">
                                <span className={cn("block clip-text-hidden", isHeroVisible && "clip-text-visible reveal-delay-100")}>
                                    Fabric
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span className={cn("block clip-text-hidden", isHeroVisible && "clip-text-visible reveal-delay-200")}>
                                    Is The
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span className={cn("block clip-text-hidden", isHeroVisible && "clip-text-visible reveal-delay-300")}>
                                    Narrative
                                </span>
                            </span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:w-1/2 flex flex-col h-auto lg:h-screen">

                {/* TOP HALF: LIGHT */}
                <div className="min-h-[50svh] lg:h-[50%] relative overflow-hidden p-8 lg:p-12 flex flex-col justify-between">
                    <div className="absolute inset-0">
                        <Image
                            src={topRightImage}
                            alt="Urban Context"
                            fill
                            className="object-cover object-center opacity-100"
                            loading="lazy"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            quality={80}
                            placeholder={blurDataUrls?.[topRightImage] ? "blur" : "empty"}
                            blurDataURL={blurDataUrls?.[topRightImage]}
                        />
                    </div>
                    <div className="relative" ref={topRef}>
                        <h2
                            className="text-[clamp(2.5rem,5vw,5rem)] font-black uppercase leading-[0.85] tracking-tight text-white"
                            style={{ mixBlendMode: 'difference' }}
                        >
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isTopVisible && "clip-text-visible reveal-delay-100")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Modern
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isTopVisible && "clip-text-visible reveal-delay-200")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Urban
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isTopVisible && "clip-text-visible reveal-delay-300")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Armor
                                </span>
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 relative">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-[3px] border-black pb-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-800">GSM — 450</span>
                                <div className="flex gap-[2px]">
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-600 leading-tight uppercase text-justify">
                                Heavyweight French Terry engineered for the concrete jungle. Pre-shrunk structure that holds its silhouette.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b-[3px] border-black pb-1">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-800">FIT — OVR</span>
                                <div className="flex gap-[2px]">
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                    <div className="w-[2px] h-3 bg-black" />
                                </div>
                            </div>
                            <p className="text-[10px] font-mono text-neutral-600 leading-tight uppercase text-justify">
                                Dropped shoulders and cropped hems. A cut designed to allow movement while commanding space.
                            </p>
                        </div>
                    </div>
                </div>

                {/* BOTTOM HALF: DARK */}
                <div className="min-h-[50svh] lg:h-[50%] relative flex items-center justify-center overflow-hidden p-8 text-center">
                    <Image
                        src={bottomRightImage}
                        alt="Texture"
                        fill
                        className="object-cover opacity-80"
                        loading="lazy"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        quality={80}
                        placeholder={blurDataUrls?.[bottomRightImage] ? "blur" : "empty"}
                        blurDataURL={blurDataUrls?.[bottomRightImage]}
                    />

                    <div className="relative max-w-xl mx-auto" ref={bottomRef}>
                        <h3
                            className="text-[clamp(1.75rem,5vw,3rem)] font-black text-white uppercase leading-[0.95] tracking-tight"
                            style={{ mixBlendMode: 'difference' }}
                        >
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isBottomVisible && "clip-text-visible reveal-delay-100")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Clothing is the interface
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isBottomVisible && "clip-text-visible reveal-delay-200")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    between you and the world.
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span
                                    className={cn("block clip-text-hidden", isBottomVisible && "clip-text-visible reveal-delay-300")}
                                    style={{ mixBlendMode: 'difference' }}
                                >
                                    Upgrade your skin.
                                </span>
                            </span>
                        </h3>
                    </div>

                </div>
            </div>
        </section>
    );
}
