import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const supabase = await createClient();

  // Fetch all active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'active');

  // Fetch all active collections
  const { data: collections } = await supabase
    .from('collections')
    .select('slug, updated_at')
    .eq('is_visible', true);

  // Fetch all published blog posts
  const { data: blogPosts } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published');

  // ─── Dynamic Entries ────────────────────────────────────────────────────────

  const collectionEntries: MetadataRoute.Sitemap = (collections || []).map((collection) => ({
    url: `${baseUrl}/collection/${collection.slug}`,
    lastModified: new Date(collection.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogEntries: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
    url: `${baseUrl}/news/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // ─── Static Entries ─────────────────────────────────────────────────────────

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collection`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // NOTE: Legal pages (terms, privacy, cookies) are intentionally excluded
  // as they have robots: noindex set.

  return [
    ...staticEntries,
    ...collectionEntries,
    ...productEntries,
    ...blogEntries,
  ];
}
