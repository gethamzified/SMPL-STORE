"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { type Collection } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CollectionCardProps {
    collection: Collection & {
        product_count?: number;
        product_images?: string[];
    };
}

export const CollectionCard = ({ collection }: CollectionCardProps) => {
    const blurDataUrls = (collection.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
    const blurSrc = collection.image_url ? blurDataUrls?.[collection.image_url] : undefined;
    const blurProps = blurSrc
        ? { placeholder: "blur" as const, blurDataURL: blurSrc }
        : {};

    const [isHovered, setIsHovered] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const hasProductImages = collection.product_images && collection.product_images.length > 0;
    const displayImages = hasProductImages ? collection.product_images! : [];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isHovered && hasProductImages) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
            }, 1000); // Change image every 1 second
        } else {
            setCurrentImageIndex(0); // Reset when not hovered
        }
        return () => clearInterval(interval);
    }, [isHovered, hasProductImages, displayImages.length]);

    return (
        <Link
            href={`/collection/${collection.slug}`}
            className="group relative aspect-[2/3] w-full overflow-hidden bg-muted block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Primary Collection Image */}
            <div className={cn(
                "absolute inset-0 transition-opacity duration-500 ease-in-out z-0",
                isHovered && hasProductImages ? "opacity-0" : "opacity-100"
            )}>
                {collection.image_url ? (
                    <Image
                        src={collection.image_url}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={80}
                        {...blurProps}
                        priority={false}
                    />
                ) : (
                    <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800" />
                )}
            </div>

            {/* Slideshow Product Images */}
            {hasProductImages && isHovered && displayImages.map((img, index) => {
                // Determine the position of the image relative to the current index
                // We want a slide-to-left effect:
                // If it's the current image, translate X is 0.
                // If it's the "next" image (coming from right), translate X is 100%.
                // If it's the "previous" image (sliding out to left), translate X is -100%.

                let positionClass = "translate-x-full opacity-0"; // default to right

                if (currentImageIndex === index) {
                    positionClass = "translate-x-0 opacity-100"; // active
                }

                return (
                    <div
                        key={`${img}-${index}`}
                        className={cn(
                            "absolute inset-0 transition-all duration-700 ease-in-out z-10 will-change-transform",
                            positionClass
                        )}
                    >
                        <Image
                            src={img}
                            alt={`${collection.title} product preview ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            quality={60} // Lower quality for hover previews to improve perf
                            loading="lazy"
                        />
                    </div>
                );
            })}

            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 z-20 pointer-events-none" />

            {/* Bottom Gradient for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 z-20 pointer-events-none" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between text-white z-30">
                <div className="flex flex-col gap-1">
                    <h3 className="font-body text-sm md:text-base font-bold uppercase tracking-[0.1em]">
                        {collection.title}
                    </h3>
                    {collection.product_count !== undefined && (
                        <span className="text-[10px] md:text-xs opacity-70 tracking-widest uppercase">
                            {collection.product_count} {collection.product_count === 1 ? 'Piece' : 'Pieces'}
                        </span>
                    )}
                </div>

                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-300">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </Link>
    );
};
