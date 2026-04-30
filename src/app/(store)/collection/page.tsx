import { CollectionCard } from "@/components/collection/CollectionCard";
import { createStaticClient } from "@/lib/supabase/static";
import { type Product, type Collection } from "@/lib/types";
import type { Metadata } from "next";

export const revalidate = 300; // 5 minutes - aggressive cache

// Static metadata - no DB call
export const metadata: Metadata = {
  title: `Shop All Collections | SMPL`,
  description: `Explore our complete range of premium fashion collections. Quality craftsmanship meets contemporary design.`,
};

export default async function CollectionPage() {
  const supabase = createStaticClient();

  // Fetch all config and data in parallel
  const [productsResult, collectionsResult] = await Promise.all([
    supabase
      .from('products')
      .select('id, category_id, cover_image')
      .eq('status', 'active'),
    supabase
      .from('collections')
      .select('id, title, slug, image_url, description')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
  ]);

  const safeProducts = (productsResult.data || []) as Pick<Product, 'id' | 'category_id' | 'cover_image'>[];
  const safeCollections = (collectionsResult.data || []) as Collection[];

  // Calculate product count per collection and grab up to 5 images for hover preview
  const collectionsWithCounts = safeCollections.map(col => {
    const colProducts = safeProducts.filter(p => p.category_id === col.id);
    const validImages = colProducts
      .map(p => p.cover_image)
      .filter((img): img is string => typeof img === 'string' && img.trim().length > 0)
      .slice(0, 5); // Limit to 5 images for performance

    return {
      ...col,
      product_count: colProducts.length,
      product_images: validImages
    };
  });

  return (
    <main className="min-h-screen bg-background">
      <div className="pt-8 md:pt-12 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        {/* Minimal Header */}
        <div className="mb-12 text-center">
          <h2 className="font-great-vibes text-red-900 text-6xl md:text-7xl leading-normal select-none">
            Collections
          </h2>
        </div>

        {/* Collections Grid - High-end editorial style */}
        {safeCollections.length > 0 && (
          <section className="mb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {collectionsWithCounts.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                />
              ))}
            </div>
          </section>
        )}

        {/* Divider */}
        {/* <div className="h-px bg-border mb-12" /> */}

        {/* All Products Removed - See /shop */}
      </div>


    </main>
  );
}
