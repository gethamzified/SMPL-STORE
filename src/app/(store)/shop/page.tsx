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
        <main className="min-h-screen bg-background text-foreground">
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

            <div className="pt-24 md:pt-32 pb-24 px-6 md:px-12">
                {/* Breadcrumbs */}
                <div className="flex justify-start mb-8">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Shop All</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>


                {/* Filters */}
                <ProductFilters />

                {/* Product Grid - Full Width */}
                <div className="min-h-[50vh]">
                    <Suspense fallback={
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="space-y-4 animate-pulse">
                                    <div className="w-full aspect-[3/4] bg-neutral-100 dark:bg-neutral-800" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-2/3 bg-neutral-100 dark:bg-neutral-800" />
                                        <div className="h-3 w-1/4 bg-neutral-100 dark:bg-neutral-800" />
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
