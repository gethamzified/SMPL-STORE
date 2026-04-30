"use client";

import { Product } from "@/lib/types";
import { memo } from "react";
import ProductCard from "@/components/product/ProductCard";

interface FeaturedGridProps {
  products: Product[];
}

/**
 * FeaturedGrid - Optimized Luxury Showcase
 * - Flush layout (no gaps between items)
 * - Minimalist, high-tracking typography
 * - Optimized image handling with hover scaling
 */
const FeaturedGrid = ({ products }: FeaturedGridProps) => {
  // Use first 4 products to match the requested 2x2 / 4-column layout
  const displayProducts = products.length > 0 ? products.slice(0, 4) : [];

  // Fallback items if no products are found in the database
  const fallbackItems = [
    { id: '1', title: 'OUTERWEAR', slug: 'outerwear', price: 0, cover_image: '', images: [] },
    { id: '2', title: 'KNITWEAR', slug: 'knitwear', price: 0, cover_image: '', images: [] },
    { id: '3', title: 'SHIRTS', slug: 'shirts', price: 0, cover_image: '', images: [] },
    { id: '4', title: 'PANTS', slug: 'pants', price: 0, cover_image: '', images: [] }
  ] as any[];

  const itemsToRender = displayProducts.length > 0 ? displayProducts : fallbackItems;

  return (
    <section className="relative w-full bg-background px-3 md:px-6 pb-8 md:pb-12 z-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
        {itemsToRender.map((product) => {
          return (
            <div
              key={product.id}
              className="group relative w-full"
            >
              <ProductCard {...(product as Product)} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default memo(FeaturedGrid);
