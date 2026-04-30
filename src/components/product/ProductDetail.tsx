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
    <div className="max-w-[1920px] mx-auto animate-in fade-in duration-500">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-3 text-[10px] font-body font-black uppercase tracking-[0.3em] text-muted-foreground mb-4 md:mb-12 px-6 md:px-0 py-4 md:py-0">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span className="opacity-30">/</span>
        <Link href="/shop" className="hover:text-foreground transition-colors">Shop</Link>
        <span className="opacity-30">/</span>
        <span className="text-foreground truncate line-clamp-1 max-w-[200px] md:max-w-none font-medium">{product.title}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 px-0 md:px-12">
        {/* Left Column: Media Gallery - ON TOP for mobile */}
        <div className="lg:col-span-7 order-1">
          <ProductGallery
            images={distinctImages}
            title={product.title}
            blurDataUrl={((product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string>)?.[distinctImages[0]] || null}
            blurDataUrls={(product.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined}
          />
        </div>

        {/* Mobile Header (Vendor + Title) - BELOW gallery on mobile */}
        <div className="lg:hidden space-y-1.5 order-2 px-6">
          <h1 className="text-xl font-bold tracking-[0.05em] text-neutral-900 leading-tight uppercase">
            {product.title}
          </h1>
          <div className="flex items-baseline gap-2">
            <p className="text-sm font-medium">
              RS.{product.sale_price || product.price}
            </p>
          </div>
        </div>

        {/* Right Column: Information (Sticky) */}
        <div className="lg:col-span-5 relative order-3 px-6 md:px-0">
          <div className="sticky top-32">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      {/* Product Details Section - Always Open */}
      <div className="mt-20 border-t border-neutral-100 pt-20 pb-32 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-12">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-neutral-400 mb-12">
              Product Stories & Details
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                Details & Care
              </h3>
              <div className="prose prose-neutral max-w-none text-neutral-600 leading-relaxed text-lg font-light">
                {product.description || "No detailed description available."}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold uppercase tracking-tight text-neutral-900">
                Shipping & Returns
              </h3>
              <div className="space-y-4 text-neutral-600 text-base font-light">
                <p>Free standard shipping on all orders nationwide. We process all orders within 24-48 business hours.</p>
                <p>Returns are accepted within 30 days of delivery. Items must be in original condition with tags attached.</p>
                <div className="pt-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
                    <span className="w-8 h-px bg-neutral-200" />
                    Secure Checkout Guaranteed
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-neutral-900">
                    <span className="w-8 h-px bg-neutral-200" />
                    Ethically Sourced & Crafted
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
