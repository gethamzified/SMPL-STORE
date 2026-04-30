import { Collection } from "@/lib/types";
import CollectionShowcase from "@/components/collection/CollectionShowcase";

interface HomeCollectionsLoaderProps {
    collectionsPromise: Promise<Collection[]>;
    startIndex?: number;
}

/**
 * Server Component that awaits collections and renders them.
 * This allows the parent to stream this content via Suspense.
 */
export async function HomeCollectionsLoader({ collectionsPromise, startIndex = 0 }: HomeCollectionsLoaderProps) {
    const collections = await collectionsPromise;

    // If we want to skip the first one (because it might be rendered differently or earlier), we can slice
    const displayCollections = startIndex > 0 ? collections.slice(startIndex) : collections;

    if (!displayCollections || displayCollections.length === 0) return null;

    return (
        <div className="relative flex flex-col items-center justify-center w-full overflow-hidden">
            {displayCollections.map((collection) => {
                const metadata = collection.metadata as Record<string, any> | undefined;
                const blurDataUrls = metadata?.blurDataUrls as Record<string, string> | undefined;
                const coverBlur = collection.image_url ? blurDataUrls?.[collection.image_url] : undefined;

                // Extract new customization props
                const showProductGrid = metadata?.show_product_grid !== false; // Default true
                const tagline = metadata?.tagline as string | undefined;

                return (
                    <CollectionShowcase
                        key={collection.id}
                        title={collection.title}
                        description={collection.description || ""}
                        coverImage={collection.image_url || ""}
                        products={collection.products || []}
                        collectionHref={`/collection/${collection.slug}`}
                        className="mb-0 cv-auto"
                        blurDataURL={coverBlur}
                        showProductGrid={showProductGrid}
                        tagline={tagline}
                    />
                );
            })}
        </div>
    );
}

/**
 * Loader for just the FIRST collection, useful for priority rendering
 */
export async function FirstCollectionLoader({ collectionsPromise }: { collectionsPromise: Promise<Collection[]> }) {
    const collections = await collectionsPromise;
    const firstCollection = collections[0];

    if (!firstCollection) return null;

    const firstBlurDataUrls = (firstCollection.metadata as Record<string, unknown>)?.blurDataUrls as Record<string, string> | undefined;
    const firstCoverBlur = firstCollection.image_url ? firstBlurDataUrls?.[firstCollection.image_url] : undefined;

    const firstMetadata = firstCollection.metadata as Record<string, any> | undefined;
    const showProductGrid = firstMetadata?.show_product_grid !== false;
    const tagline = firstMetadata?.tagline as string | undefined;

    return (
        <CollectionShowcase
            title={firstCollection.title}
            description={firstCollection.description || ""}
            coverImage={firstCollection.image_url || ""}
            products={firstCollection.products || []}
            collectionHref={`/collection/${firstCollection.slug}`}
            className="mb-0"
            blurDataURL={firstCoverBlur}
            showProductGrid={showProductGrid}
            tagline={tagline}
        />
    );
}
