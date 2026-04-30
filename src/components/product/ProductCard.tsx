"use client";
// optimized

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { Eye, Heart, Star, ShoppingBag, Plus } from "lucide-react";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useFormatCurrency } from "@/context/StoreConfigContext";
import { useQuickView } from "@/context/QuickViewContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

interface ProductCardProps extends Product {
  priority?: boolean;
}

const ProductCard = React.memo(({ priority = false, ...product }: ProductCardProps) => {
  const formatCurrency = useFormatCurrency();
  const { openQuickView } = useQuickView();
  const { addItem } = useCart();
  const { isInWishlist, toggleItem } = useWishlist();
  const [imageLoaded, setImageLoaded] = useState(false);

  const { title, price, images, slug, cover_image, sale_price, tags, id, review_count, average_rating, metadata, variants } = product;

  const isValidImage = (img: any): img is string => typeof img === 'string' && img.trim().length > 0;

  const imagePrimary = isValidImage(cover_image) ? cover_image : (images?.find(isValidImage) || "");
  const imageSecondary = images?.filter(isValidImage).find(img => img !== imagePrimary) || imagePrimary;
  const href = `/product/${slug}`;

  // Resolve blur placeholder
  const blurDataUrls = (metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
  const primaryBlur = blurDataUrls?.[imagePrimary] || undefined;

  const sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 400px";

  // Logic
  const isSale = !!(sale_price && sale_price < price);
  const isNew = tags?.some(t => t.toLowerCase() === 'new');
  const savedAmount = isSale ? price - (sale_price as number) : 0;
  const isWishlisted = isInWishlist(id);
  const hasVariants = variants && variants.length > 0;

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product as Product);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!hasVariants) {
      addItem({
        id: product.id,
        productId: product.id,
        name: title,
        price: sale_price || price,
        image: imagePrimary,
        size: "",
        quantity: 1,
        slug: slug,
      } as any, true);
    } else {
      openQuickView(product as Product);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(id, title);
  };

  return (
    <div className="group relative flex flex-col w-full">
      {/* --- Image Container --- */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted border border-border rounded-none"> {/* Standard fashion aspect ratio */}

        <Link href={href} className="absolute inset-0 z-10 block" aria-label={`View ${title}`}>
          {/* Images */}
          <div className="relative w-full h-full">
            {isValidImage(imagePrimary) && (
              <Image
                src={imagePrimary}
                alt={title}
                fill
                priority={priority}
                sizes={sizes}
                quality={75}
                placeholder={primaryBlur ? "blur" : "empty"}
                blurDataURL={primaryBlur}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "object-cover transition-all duration-700 ease-in-out",
                  imageLoaded ? "opacity-100" : "opacity-0",
                  // Zoom effect on hover
                  "group-hover:scale-105"
                )}
              />
            )}
            {/* Secondary Image (Swap on Hover) */}
            {isValidImage(imageSecondary) && (
              <Image
                src={imageSecondary}
                alt={`${title} alternate view`}
                fill
                loading="lazy"
                sizes={sizes}
                quality={75}
                placeholder={blurDataUrls?.[imageSecondary] ? "blur" : "empty"}
                blurDataURL={blurDataUrls?.[imageSecondary]}
                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 hidden md:block"
              />
            )}
          </div>
        </Link>

        {/* --- Badges (Top Left) --- */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1 pointer-events-none">
          {isSale && (
            <span className="bg-red-600 text-white text-[10px] sm:text-[12px] font-semibold px-2 py-1 sm:px-3 sm:py-[5px] rounded-full leading-none shadow-sm flex items-center justify-center max-w-[90%] truncate">
              Save {formatCurrency(savedAmount).replace(/\s/g, '')}
            </span>
          )}
          {isNew && !isSale && (
            <span className="bg-white/90 backdrop-blur-sm text-neutral-900 text-[10px] font-bold px-2 py-1 uppercase tracking-wide rounded-sm shadow-sm">
              New
            </span>
          )}
        </div>

        {/* --- Floating Action Buttons (Top Right) --- */}
        <div className="absolute top-2 right-2 z-30 flex flex-col gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          {/* Wishlist */}
          <button
            onClick={handleWishlistToggle}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors shadow-sm",
              "bg-background/90 backdrop-blur border border-border/60 hover:bg-background",
              isWishlisted ? "text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Quick View (Desktop) */}
          <button
            onClick={handleQuickView}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-background/90 backdrop-blur border border-border/60 text-muted-foreground hover:text-foreground hover:bg-background shadow-sm transition-colors md:flex hidden"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        {/* --- Quick Add Button (Slide Up) --- */}
        <div className="absolute bottom-4 left-4 right-4 z-30 hidden md:block">
          <button
            onClick={handleQuickAdd}
            className={cn(
              "w-full py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md",
              "bg-white text-black hover:bg-black hover:text-white border border-transparent",
              // Animation: Slide up and fade in
              "translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            )}
          >
            {hasVariants ? "Choose Options" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* --- Product Info --- */}
      <div className="mt-4 flex flex-col space-y-1">
        <div className="flex justify-between items-start gap-4">
          <Link href={href} className="group/title">
            <h3 className="text-sm font-medium text-foreground leading-snug transition-colors group-hover/title:text-muted-foreground">
              {title}
            </h3>
          </Link>

          {/* Price */}
          <div className="flex flex-col items-end shrink-0">
            {isSale ? (
              <div className="flex flex-col items-end">
                <span className="text-destructive font-semibold text-sm">
                  {formatCurrency(sale_price || 0)}
                </span>
                <span className="text-muted-foreground text-[13px] font-medium line-through decoration-muted-foreground/60">
                  {formatCurrency(price || 0)}
                </span>

              </div>
            ) : (
              <span className="text-foreground font-medium text-sm">
                {formatCurrency(price || 0)}
              </span>
            )}
          </div>
        </div>

        {/* Reviews */}
        {(review_count ?? 0) > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="w-3 h-3 fill-foreground text-foreground" />
            <span className="text-xs text-muted-foreground font-medium">{average_rating}</span>
            <span className="text-[10px] text-muted-foreground/70">({review_count})</span>
          </div>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;