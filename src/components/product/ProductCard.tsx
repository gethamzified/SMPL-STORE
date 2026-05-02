"use client";
// optimized

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";

interface ProductCardProps extends Product {
  priority?: boolean;
}

const ProductCard = React.memo(({ priority = false, ...product }: ProductCardProps) => {
  const formatCurrency = useFormatCurrency();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { title, price, images, slug, cover_image, metadata, stock, variants } = product;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary);
  const hasSecondaryImage = !!imageSecondary;
  const href = `/product/${slug}`;

  // Resolve blur placeholder
  const blurDataUrls = (metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
  const primaryBlur = blurDataUrls?.[imagePrimary] || undefined;

  const sizes = "(max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw";

  // Stock check
  const isSoldOut = stock !== undefined && stock <= 0 && (!variants || variants.length === 0 || variants.every(v => (v.stock ?? 0) <= 0));

  return (
    <div className="group relative flex flex-col h-full bg-white overflow-hidden">
      {/* Image Area */}
      <div className="relative aspect-square flex items-center justify-center p-8 sm:p-12 overflow-hidden bg-white">
        {isSoldOut && (
          <div className="absolute top-0 right-0 bg-brand-ascent text-white text-[10px] font-bold px-2 py-1 z-20 pointer-events-none uppercase tracking-wide">
            Sold Out
          </div>
        )}
        
        <Link href={href} className="absolute inset-0 z-10 block" aria-label={`View ${title}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            {isValidImage(imagePrimary) && (
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={85}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "object-contain transition-all duration-500 ease-in-out",
                  imageLoaded ? "opacity-100" : "opacity-0",
                  hasSecondaryImage && "group-hover:opacity-0 group-hover:scale-105"
                )}
              />
            )}
            {/* Secondary Image (Swap on Hover) */}
            {hasSecondaryImage && (
              <Image
                src={imageSecondary}
                alt={`${title} alternate view`}
                fill
                loading="lazy"
                sizes={sizes}
                quality={85}
                className="absolute inset-0 object-contain opacity-0 transition-all duration-500 ease-in-out group-hover:opacity-100 hidden md:block"
              />
            )}
          </div>
        </Link>
      </div>

      {/* Info Area - mt-auto ensures the bar stays at the bottom */}
      <div className="mt-auto border-t border-[#1a1a1a] p-4 sm:p-5 flex flex-col gap-2 bg-white">
        <Link href={href} className="group/title truncate">
          <h3 className={cn(
            "text-[11px] sm:text-[12px] font-bold uppercase tracking-widest transition-colors truncate",
            isSoldOut ? "line-through text-black/60 decoration-black/60" : "text-black group-hover/title:text-brand-ascent"
          )}>
            {title}
          </h3>
        </Link>
        <div className={cn(
          "text-[10px] sm:text-[11px] font-bold uppercase tracking-wider",
          isSoldOut ? "line-through text-black/60 decoration-black/60" : "text-black group-hover:text-brand-ascent transition-colors"
        )}>
          {isSoldOut ? "Sold Out" : formatCurrency(price || 0)}
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;