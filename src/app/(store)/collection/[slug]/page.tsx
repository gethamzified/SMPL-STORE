import { Suspense } from "react";

import AsyncProductGrid from "@/components/collection/AsyncProductGrid";
import ProductFilters from "@/components/collection/ProductFilters";
import MobileCollectionList from "@/components/shop/MobileCollectionList";
import { Collection } from "@/lib/types";
import { notFound } from "next/navigation";
import * as collectionsApi from "@/lib/api/collections";
import { ProductService } from "@/services/products";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export const revalidate = 3600; // ISR: 1 hour — collections change less frequently

// Pre-build all visible collection pages at deploy time
// Pre-build all visible collection pages at deploy time
export async function generateStaticParams() {
    const { data } = await collectionsApi.getCollections({ visible: true });
    return (data || []).map((c) => ({ slug: c.slug }));
}

export const dynamicParams = true;

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// High-end store: Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;

    const { data: collection } = await collectionsApi.getCollection(slug);

    if (!collection) {
        return { title: 'Collection Not Found' };
    }

    return {
        title: collection.seo_title || `${collection.title} Collection | SMPL`,
        description: collection.seo_description || collection.description || `Shop our ${collection.title} collection`,
        openGraph: {
            title: collection.seo_title || `${collection.title} Collection | SMPL`,
            description: collection.seo_description || collection.description || `Shop our ${collection.title} collection`,
            type: "website",
            url: `https://smpl.studio/collection/${collection.slug}`,
            images: [
                {
                    url: collection.image_url || "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg",
                    width: 1200,
                    height: 630,
                    alt: collection.title,
                }
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: collection.seo_title || `${collection.title} Collection | SMPL`,
            description: collection.seo_description || collection.description || `Shop our ${collection.title} collection`,
            images: [collection.image_url || "https://framerusercontent.com/images/T0Z10o3Yaf4JPrk9f5lhcmJJwno.jpg"],
        }
    };
}

export default async function CollectionDetailPage({ params, searchParams }: Props) {
    const { slug } = await params;
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

    const [collectionResult, collectionsListResult] = await Promise.all([
        collectionsApi.getCollection(slug),
        collectionsApi.getCollections({ visible: true })
    ]);

    const collection = collectionResult.data;
    if (!collection) notFound();

    const allCollections = (collectionsListResult.data || []) as Collection[];

    const productsPromise = ProductService.getProducts({
        categoryId: collection.id,
        status: 'active',
        orderBy,
        order,
        limit: 40,
        sizes: sizeFilter
    }).then(res => res.data);

    return (
        <main className="min-h-screen bg-background text-foreground selection:bg-black selection:text-white font-sans overflow-visible">
            {/* Collection Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": collection.title,
                        "description": collection.seo_description || collection.description || `Shop our ${collection.title} collection`,
                        "url": `https://smpl.studio/collection/${collection.slug}`,
                        "mainEntity": {
                            "@type": "ItemList",
                            "itemListElement": await productsPromise.then(products =>
                                (products || []).map((product, index) => ({
                                    "@type": "ListItem",
                                    "position": index + 1,
                                    "url": `https://smpl.studio/product/${product.slug}`
                                }))
                            )
                        }
                    })
                }}
            />
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
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": collection.title,
                                "item": `https://smpl.studio/collection/${collection.slug}`
                            }
                        ]
                    })
                }}
            />
            {/* Visually Hidden Semantic H1 */}
            <h1 className="sr-only">{collection.title} Collection</h1>

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
                                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{collection.title}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                {/* Collections Menu (Visible on all screens) */}
                <div className="mb-8">
                    <MobileCollectionList collections={allCollections} />
                </div>

                {/* Filters */}
                <ProductFilters />

                {/* Product Grid - Full Width */}
                <div className="min-h-[50vh]">
                    <Suspense fallback={
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
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
