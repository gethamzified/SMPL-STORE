import { Suspense } from "react";
// rebuild-force-1
import { ProductService } from "@/services/products";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductGrid from "@/components/product/ProductGrid";
import { Product } from "@/lib/types";

export const revalidate = 3600; // ISR: 1 hour — cached shop listing

export const metadata = {
    title: "Shop All | SMPL",
    description: "Browse our complete collection of premium fashion items.",
    openGraph: {
        title: "Shop All | SMPL",
        description: "Browse our complete collection of premium fashion items.",
        type: "website",
        url: "https://smpl.studio/shop",
        images: [
            {
                url: "https://smpl.studio/pexels-koolshooters-6982602.webp",
                width: 1200,
                height: 630,
                alt: "Shop SMPL",
            }
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Shop All | SMPL",
        description: "Browse our complete collection of premium fashion items.",
        images: ["https://smpl.studio/pexels-koolshooters-6982602.webp"],
    }
};

export default async function ShopPage({ searchParams }: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedSearchParams = await searchParams;

    const sizeFilter = typeof resolvedSearchParams.size === 'string' ? resolvedSearchParams.size.split(',') : undefined;
    const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest';

    let orderBy: 'created_at' | 'price' | 'title' = 'created_at';
    let order: 'asc' | 'desc' = 'desc';

    if (sort === 'price-asc') {
        orderBy = 'price';
        order = 'asc';
    } else if (sort === 'price-desc') {
        orderBy = 'price';
        order = 'desc';
    }

    // Fetch All Products (Cached)
    const productsPromise = ProductService.getProducts({
        status: 'active',
        orderBy,
        order,
        limit: 40,
        sizes: sizeFilter
    }).then(res => res.data);


    return (
        <main className="relative z-10 min-h-screen bg-white text-foreground">
            {/* Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://smpl.studio"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Shop",
                                "item": "https://smpl.studio/shop"
                            }
                        ]
                    })
                }}
            />
            {/* Visually Hidden Semantic H1 */}
            <h1 className="sr-only">Shop All SMPL Products</h1>

            <div className="pt-28 md:pt-32 pb-20 md:pb-24">
                {/* Full-Width Breadcrumbs */}
                <div className="w-full border-b border-[#1a1a1a] bg-white">
                    <div className="px-6 md:px-12 py-4 flex items-center">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/" className="text-[10px] font-bold uppercase tracking-widest">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-[10px] font-bold uppercase tracking-widest text-[#d95e32]">Shop All</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                </div>

                {/* Filters - Still with padding */}
                <div className="px-6 md:px-12 pt-4">
                    {/* Filters */}
                    <ProductFilters />
                </div>

                {/* Product Grid - Universal Component */}
                <div className="min-h-[50vh] w-full">
                    <Suspense fallback={
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 border-t border-l border-[#1a1a1a]">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className="flex flex-col border-b border-r border-[#1a1a1a] animate-pulse">
                                    <div className="aspect-square bg-neutral-100" />
                                    <div className="h-[70px] bg-white border-t border-[#1a1a1a] px-3 py-3">
                                        <div className="h-3 w-3/4 bg-neutral-100 mb-2" />
                                        <div className="h-3 w-1/2 bg-neutral-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    }>
                        <AsyncProductGrid productsPromise={productsPromise} />
                    </Suspense>
                </div>
            </div>


        </main>
    );
}

async function AsyncProductGrid({ productsPromise }: { productsPromise: Promise<Product[]> }) {
    const products = await productsPromise;

    if (!products || products.length === 0) {
        return (
            <div className="py-20 text-center px-6">
                <h3 className="text-2xl font-display mb-2">No items found</h3>
                <p className="text-muted-foreground font-light text-sm uppercase tracking-widest">
                    Try adjusting your silhouette or size selection
                </p>
            </div>
        );
    }

    return <ProductGrid products={products} />;
}

function ProductFilters() {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 py-4 border-y border-[#1a1a1a]/10">
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               <span>Showing All Silhouettes</span>
            </div>
        </div>
    );
}
