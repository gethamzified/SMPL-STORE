import { Product } from "@/lib/types";
import { HomepageSection } from "@/lib/types";
import FeaturedGrid from "@/components/sections/FeaturedGrid";

interface HomeProductsLoaderProps {
    productsPromise: Promise<Product[]>;
    content?: HomepageSection['content'];
}

/**
 * Server Component that awaits products and renders the featured grid.
 */
export async function HomeProductsLoader({ productsPromise, content }: HomeProductsLoaderProps) {
    const products = await productsPromise;

    return (
        <section className="w-full bg-background">
            <div className="border-y border-border py-5 md:py-6 text-center">
                <h2 className="font-display text-2xl md:text-4xl uppercase tracking-[0.22em] text-foreground select-none">
                    {content?.title || 'NEW RELEASES !'}
                </h2>
            </div>

            <FeaturedGrid products={products} />
        </section>
    );
}
