import { notFound } from "next/navigation";
import { createStaticClient } from "@/lib/supabase/static";
import { ProductService } from "@/services/products";

import ProductDetail from "@/components/product/ProductDetail";
import RelatedProducts from "@/components/product/RelatedProducts";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductLookbook } from "@/components/product/ProductLookbook";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Product } from "@/lib/types";
import { Metadata } from "next";
import {
  generateProductJsonLd,
  generateBreadcrumbJsonLd,
  truncateDescription,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from "@/lib/seo";

export const revalidate = 3600; // Revalidate every hour

// Pre-build all active product pages at deploy time (Shopify-style)
export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('products')
    .select('slug')
    .eq('status', 'active');
  return (data || []).map((p) => ({ slug: p.slug }));
}

// Allow new products added after build to be ISR-rendered on demand
export const dynamicParams = true;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Fetch product for metadata (Cached)
  let product: Product | null = null;
  try {
    product = await ProductService.getProductBySlug(slug);
  } catch (e) {
    // ignore error
  }

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  const title = product.title;
  const description = truncateDescription(
    product.seo_description || product.description,
    160
  );
  const canonicalUrl = `${SITE_URL}/product/${slug}`;
  const images = product.cover_image
    ? [
        {
          url: product.cover_image,
          width: 1200,
          height: 630,
          alt: `${product.title} — ${SITE_NAME}`,
        },
      ]
    : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }];

  return {
    title: product.seo_title || title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${product.seo_title || title} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.seo_title || title} | ${SITE_NAME}`,
      description,
      images: images.map((img) => img.url),
      creator: TWITTER_HANDLE,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  // Fetch product and all config in parallel
  const product = await ProductService.getProductBySlug(slug, { includeStock: false }).catch(() => null);

  if (!product) {
    notFound();
  }

  const productData = product;
  const typedProduct = productData as Product;

  // Fetch Related Products (Cached)
  const relatedProducts = await ProductService.getProducts({
    status: 'active',
    limit: 4
  }).then(res => res.data.filter(p => p.id !== typedProduct.id));

  const safeRelated = (relatedProducts || []) as Product[];

  return (
    <main className="relative z-10 min-h-screen bg-white text-foreground overflow-x-hidden">
      {/* Product Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductJsonLd(typedProduct)),
        }}
      />
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbJsonLd([
              { name: 'Home', url: SITE_URL },
              { name: 'Shop', url: `${SITE_URL}/shop` },
              {
                name: typedProduct.title,
                url: `${SITE_URL}/product/${typedProduct.slug}`,
              },
            ])
          ),
        }}
      />
      <div className="pt-12 md:pt-16 pb-12 md:pb-16 px-0 md:px-4">
        <ProductDetail product={typedProduct} />
      </div>

      <div className="max-w-[1600px] mx-auto">
        <ProductLookbook product={typedProduct} />
      </div>

      <div className="max-w-[1600px] mx-auto border-t-2 border-[#1a1a1a]">
        <Suspense fallback={<div className="p-8 h-64 bg-white animate-pulse" />}>
          <ProductReviews productId={typedProduct.id} />
        </Suspense>
      </div>


      <div className="max-w-[1600px] mx-auto border-t-2 border-[#1a1a1a] bg-white">
        <div className="flex items-center justify-between px-4 md:px-6 py-5 border-b-2 border-[#1a1a1a]">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-black">
            Related Objects
          </h2>
          <Link href="/shop" className="text-[9px] font-black uppercase tracking-widest text-black hover:text-[#d95e32] transition-colors underline underline-offset-3">
            View All
          </Link>
        </div>
        <div className="px-0">
          <RelatedProducts products={safeRelated} />
        </div>
      </div>
    </main>
  );
}

