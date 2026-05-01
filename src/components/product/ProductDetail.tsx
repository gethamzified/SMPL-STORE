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
      {/* Breadcrumbs - Brutalist Outlined */}
      <nav className="flex items-center text-[10px] font-bold uppercase tracking-widest text-black border-b border-[#1a1a1a] px-6 md:px-12 py-6 bg-white">
        <div className="inline-flex items-center border border-[#1a1a1a] px-4 py-2 gap-3">
          <Link href="/" className="hover:text-[#d95e32] transition-colors">Home</Link>
          <span className="opacity-30">/</span>
          <Link href="/shop" className="hover:text-[#d95e32] transition-colors">Shop</Link>
          <span className="opacity-30">/</span>
          <span className="truncate max-w-[200px] text-[#d95e32]">{product.title}</span>
        </div>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch border-b border-[#1a1a1a]">
        
        {/* Left Column: Media Gallery */}
        <div className="border-r-0 lg:border-r border-[#1a1a1a]">
          <ProductGallery
            images={distinctImages}
            title={product.title}
            blurDataUrl={((product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string>)?.[distinctImages[0]] || null}
            blurDataUrls={(product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined}
          />
        </div>

        {/* Right Column: Information Panel */}
        <div className="px-6 py-8 md:p-12 lg:p-16">
          <div className="lg:sticky lg:top-32">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Product Narrative & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch border-b border-[#1a1a1a]">
        {/* Narrative */}
        <div className="p-6 md:p-12 lg:p-16 border-r-0 lg:border-r border-[#1a1a1a] border-b lg:border-b-0">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-8">
              Details & Composition
            </h3>
            <div className="prose prose-sm prose-neutral max-w-none text-black leading-relaxed font-medium">
              {product.description || "Every SMPL piece is a testament to minimalist design and uncompromising quality. This product represents our core philosophy of brutalist aesthetics met with daily functionality."}
            </div>
        </div>

        {/* Shipping */}
        <div className="p-6 md:p-12 lg:p-16">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-black mb-8">
              Shipping & Returns
            </h3>
            <div className="space-y-6 text-black text-sm font-medium">
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-[#d95e32] mt-1.5 shrink-0" />
                <p>Complimentary standard shipping on all domestic orders over RS. 5,000.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-[#d95e32] mt-1.5 shrink-0" />
                <p>Express processing: all orders dispatched within 24-48 business hours.</p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-1.5 h-1.5 bg-[#d95e32] mt-1.5 shrink-0" />
                <p>Hassle-free returns within 30 days. Must be in original, unworn condition with all tags attached.</p>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
