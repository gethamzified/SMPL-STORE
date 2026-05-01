"use client";

import ProductCard from "@/components/product/ProductCard";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  gridClassName?: string;
  animate?: boolean;
}

/**
 * Universal Product Grid
 * Implements the "Top-Left Container, Bottom-Right Item" logic
 * for a perfectly aligned 1px brutalist grid.
 */
export default function ProductGrid({ 
  products, 
  className, 
  gridClassName,
  animate = true 
}: ProductGridProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 border-t border-l border-[#1a1a1a]",
        gridClassName
      )}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className={cn(
              "h-full border-b border-r border-[#1a1a1a]",
              animate && "animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out-expo fill-mode-both"
            )}
            style={animate ? { animationDelay: `${(index % 12) * 50}ms` } : undefined}
          >
            <ProductCard {...product} priority={index < 4} />
          </div>
        ))}
      </div>
    </div>
  );
}
