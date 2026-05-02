"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import { outlinedBorder } from "@/lib/outline";
export default function ProductDetail({
  product
}: {
  product: Product
}) {
  // Construct image list
  const validImages = [product.cover_image, ...(product.images || [])].filter((img): img is string => !!img && img.trim().length > 0);
  const distinctImages = Array.from(new Set(validImages)); // De-duplicate

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700 bg-white relative z-20">

      {/* Main Product Grid - Compact - Better proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 items-start gap-0 border-b-2 border-[#1a1a1a]">
        
        {/* Left Column: Media Gallery (2/3 width on desktop) */}
        <div className="lg:col-span-2 border-r-0 lg:border-r-2 border-[#1a1a1a]">
          <ProductGallery
            images={distinctImages}
            title={product.title}
            blurDataUrl={((product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string>)?.[distinctImages[0]] || null}
            blurDataUrls={(product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined}
          />
        </div>

        {/* Right Column: Information Panel (1/3 width) */}
        <div className="px-4 py-6 md:px-6 md:py-8 lg:p-8 bg-white">
          <div className="lg:sticky lg:top-40">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Product Details Section - Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Details Panel */}
        <div className="rounded-none border-2 border-[#1a1a1a] bg-white m-4 p-6 md:p-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 border-b-2 border-[#1a1a1a] pb-3">
            Details & Composition
          </h3>
          <div className="text-sm text-black leading-relaxed font-medium space-y-4">
            {product.description || "Every SMPL piece is a testament to minimalist design and uncompromising quality. This product represents our core philosophy of brutalist aesthetics met with daily functionality."}
          </div>
        </div>

        {/* Shipping Panel */}
        <div className="rounded-none border-2 border-[#1a1a1a] bg-white m-4 p-6 md:p-8">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 border-b-2 border-[#1a1a1a] pb-3">
            Shipping & Returns
          </h3>
          <div className="space-y-4 text-black text-xs font-medium">
            <div className="flex gap-3 items-start">
              <div className="w-1 h-1 bg-brand-ascent mt-2 shrink-0 border border-[#1a1a1a]" />
              <p className="leading-tight">Complimentary standard shipping on all domestic orders over RS. 5,000.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1 h-1 bg-brand-ascent mt-2 shrink-0 border border-[#1a1a1a]" />
              <p className="leading-tight">Express processing: all orders dispatched within 24-48 business hours.</p>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-1 h-1 bg-brand-ascent mt-2 shrink-0 border border-[#1a1a1a]" />
              <p className="leading-tight">Hassle-free returns within 30 days. Original condition required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
