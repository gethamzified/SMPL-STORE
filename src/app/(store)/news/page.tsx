import Link from "next/link";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";

export const revalidate = 300; // 5 minutes - aggressive cache

// Fallback articles if no blog posts in DB
const fallbackArticles = [
  {
    id: '1',
    title: "The Spring Edit: Foundation Pieces",
    slug: "spring-2025-essentials",
    excerpt: "Polos and relaxed tailoring for the new season. Discover our curated selection of lightweight fabrics and versatile silhouettes designed for warmer days.",
    featured_image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?q=80&w=1400",
    published_at: "2026-01-02",
  },
  {
    id: '2',
    title: "The Workshop: A New Perspective",
    slug: "pop-up-experience",
    excerpt: "A temporary space dedicated to craftsmanship. Visit our immersive retail experience featuring exclusive pieces and behind-the-scenes insights.",
    featured_image: "https://images.unsplash.com/photo-1495121605193-b116b5b09a3f?q=80&w=1400",
    published_at: "2025-12-15",
  },
  {
    id: '3',
    title: "On Craft and Materiality",
    slug: "responsible-fabric",
    excerpt: "Our sourcing process, from field to form. Learn about our commitment to sustainable practices and ethical manufacturing.",
    featured_image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?q=80&w=1400",
    published_at: "2025-11-28",
  },
];

export default async function NewsPage() {
  const supabase = createStaticClient();

  const postsResult = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image, published_at, author_name')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // Use DB posts if available, otherwise fallback
  const articles = (postsResult.data && postsResult.data.length > 0)
    ? postsResult.data
    : fallbackArticles;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-10 md:pt-14 pb-16 px-6 md:px-12">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="section-title text-foreground mb-4">Inside SMPL</h1>
          <p className="text-muted-foreground font-body text-base md:text-lg max-w-xl">
            Stories of craftsmanship, style perspectives, and the latest from our studio.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="px-6 md:px-12 pb-20">
        <div className="space-y-16">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <Link href={`/news/${article.slug}`} className="group block aspect-[4/3] overflow-hidden relative bg-muted">
                {article.featured_image ? (
                  <Image
                    src={article.featured_image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300" />
                )}
              </Link>
              <div>
                <p className="font-body text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  {formatDate(article.published_at)}
                </p>
                <Link href={`/news/${article.slug}`}>
                  <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4 hover:opacity-70 transition-opacity">
                    {article.title}
                  </h2>
                </Link>
                <p className="font-body text-muted-foreground leading-relaxed mb-6">
                  {article.excerpt || 'Read more...'}
                </p>
                <Link
                  href={`/news/${article.slug}`}
                  className="font-body text-sm text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>


    </main>
  );
}
