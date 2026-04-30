"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import ProductCard from "@/components/product/ProductCard";
import { ScrollReveal } from "../animations/ScrollReveal";

interface ProductGridSectionProps {
  products: Product[];
  title?: string;
  description?: string;
  viewAllLink?: string;
}

/**
 * ProductGridSection - Client Component Version
 * 
 * Updated to use ScrollReveal for state-based entrance animations
 * following Shopify-style best practices.
 */
const ProductGridSection = ({
  products,
  title = "Proven\nFavorites",
  description = "Icons that endure year after year — top-rated staples chosen again and again by real customers for their timeless fit, premium feel, and effortless versatility.",
  viewAllLink = "/collection/all"
}: ProductGridSectionProps) => {
  // Use first 3 products for featured section
  const displayProducts = products.slice(0, 3);

  return (
    <section className="relative w-full bg-background overflow-hidden z-10">
      <ScrollReveal threshold={0.1} className="flex flex-col items-center justify-center w-full">
        <div
          className="flex flex-col items-center justify-center w-full"
          style={{ maxWidth: '1920px', margin: '0 auto' }}
        >
          {/* Container with padding matching template */}
          <div className="w-full px-6 md:px-10 py-24 md:py-[150px] flex flex-col gap-16 md:gap-20">

            {/* Section Header - Split layout */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 w-full overflow-hidden border-b border-foreground/10 pb-12">
              {/* Title - Left */}
              <h2
                className="text-foreground whitespace-pre-line font-display font-black tracking-tight leading-[0.9] transition-[opacity,transform] duration-700 ease-out group-[.is-visible]/reveal:opacity-100 group-[.is-visible]/reveal:translate-y-0 opacity-0 translate-y-8"
                style={{
                  fontSize: 'clamp(48px, 8vw, 120px)',
                }}
              >
                {title}
              </h2>

              {/* Description - Right */}
              <div className="md:w-1/3 transition-[opacity,transform] duration-700 delay-200 ease-out opacity-0 translate-y-4 group-[.is-visible]/reveal:opacity-100 group-[.is-visible]/reveal:translate-y-0">
                <p
                  className="text-muted-foreground font-body font-medium italic mb-6"
                  style={{
                    fontSize: 'clamp(16px, 1.8vw, 22px)',
                    lineHeight: '130%'
                  }}
                >
                  {description}
                </p>
                <Link
                  href={viewAllLink}
                  className="inline-flex items-center gap-2 text-xs font-body font-black uppercase tracking-[0.2em] group border-b border-foreground pb-2 hover:opacity-70 transition-all"
                >
                  Explore Collection
                  <div className="w-4 h-4 rounded-full border border-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>

            {/* Grid - 3 columns with stagger animation linked to scroll */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-24">
              {displayProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="h-full transition-[opacity,transform] duration-700 ease-out opacity-0 translate-y-8 group-[.is-visible]/reveal:opacity-100 group-[.is-visible]/reveal:translate-y-0"
                  style={{ transitionDelay: `${index * 200 + 100}ms` }}
                >
                  <ProductCard {...product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
};

export default ProductGridSection;
