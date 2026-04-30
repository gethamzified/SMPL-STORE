"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
export default function ProductDetail({
  product
}: {
  product: Product
}) {
  // Construct image list
  const validImages = [product.cover_image, ...(product.images || [])].filter((img): img is string => !!img && img.trim().length > 0);
  const distinctImages = Array.from(new Set(validImages)); // De-duplicate

  return (
    <div className="max-w-[1920px] mx-auto animate-in fade-in duration-700 bg-white">
      {/* Breadcrumbs - Hidden on mobile for cleaner look, or kept minimal */}
      <nav className="hidden md:flex items-center gap-3 text-[10px] font-body font-black uppercase tracking-[0.3em] text-muted-foreground mb-12 px-12">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="opacity-30">/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground truncate font-medium">{product.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-7 xl:col-span-8">
          <ProductGallery
            images={distinctImages}
            title={product.title}
            blurDataUrl={((product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string>)?.[distinctImages[0]] || null}
            blurDataUrls={(product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined}
          />
        </div>

        {/* Right Column: Information Panel */}
        <div className="lg:col-span-5 xl:col-span-4 px-6 py-8 md:py-10 lg:py-0 lg:px-0 lg:pr-8 xl:pr-12">
          <div className="lg:sticky lg:top-32">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Product Narrative & Specifications */}
      <div className="mt-16 lg:mt-28 border-t border-neutral-100 pt-16 md:pt-20 pb-20 md:pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          <div className="lg:col-span-12 mb-8">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400 mb-4">The Narrative</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-neutral-900 uppercase">
              Product Stories & Details
            </h2>
          </div>

          <div className="lg:col-span-7">
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-900/10 pb-4">
                Details & Composition
              </h3>
              <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed text-lg font-light">
                {product.description || "Every SMPL piece is a testament to minimalist design and uncompromising quality. This product represents our core philosophy of brutalist aesthetics met with daily functionality."}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="space-y-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-900 border-b border-neutral-900/10 pb-4">
                Shipping & Returns
              </h3>
              <div className="space-y-6 text-neutral-600 text-base font-light">
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-1 rounded-full bg-neutral-900 mt-2 shrink-0" />
                  <p>Complimentary standard shipping on all domestic orders over RS. 5,000.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-1 rounded-full bg-neutral-900 mt-2 shrink-0" />
                  <p>Express processing: all orders dispatched within 24-48 business hours.</p>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-1 rounded-full bg-neutral-900 mt-2 shrink-0" />
                  <p>Hassle-free returns within 30 days. Must be in original, unworn condition with all tags attached.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
