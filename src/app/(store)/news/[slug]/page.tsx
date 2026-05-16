import { notFound } from "next/navigation";
import Image from "next/image";
import { createStaticClient } from "@/lib/supabase/static";
import { BlogPost } from "@/lib/types";
import { Metadata } from "next";
import {
  generateArticleJsonLd,
  generateBreadcrumbJsonLd,
  truncateDescription,
  SITE_URL,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  TWITTER_HANDLE,
} from "@/lib/seo";

export const revalidate = 300; // ISR: 5 minutes — blog content changes infrequently

// Pre-build all published blog post pages
export async function generateStaticParams() {
    const supabase = createStaticClient();
    const { data } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('status', 'published');
    return (data || []).map((p) => ({ slug: p.slug }));
}

export const dynamicParams = true;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getPostBySlug(slug: string): Promise<BlogPost | null> {
    const supabase = createStaticClient();
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

    if (error || !data) return null;
    return data as BlogPost;
}

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return { title: "Article Not Found" };
    }

    const title = post.seo_title || post.title;
    const description = truncateDescription(
        post.seo_description || post.excerpt || post.content,
        160
    );
    const canonicalUrl = `${SITE_URL}/news/${slug}`;
    const image = post.featured_image || DEFAULT_OG_IMAGE;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url: canonicalUrl,
            type: "article",
            publishedTime: post.published_at || post.created_at,
            modifiedTime: post.updated_at,
            authors: [post.author_name || SITE_NAME],
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | ${SITE_NAME}`,
            description,
            images: [image],
            creator: TWITTER_HANDLE,
        },
    };
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default async function NewsDetailPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return notFound();

    return (
        <article className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
            {/* Article Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateArticleJsonLd(post)),
                }}
            />
            {/* Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(
                        generateBreadcrumbJsonLd([
                            { name: "Home", url: SITE_URL },
                            { name: "News", url: `${SITE_URL}/news` },
                            { name: post.title, url: `${SITE_URL}/news/${post.slug}` },
                        ])
                    ),
                }}
            />

            <div className="max-w-4xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="font-display text-4xl md:text-6xl mb-6">{post.title}</h1>
                    <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
                        <span>{new Date(post.published_at || post.created_at || Date.now()).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.author_name}</span>
                    </div>
                </div>

                {post.featured_image && (
                    <div className="relative w-full aspect-video mb-16 rounded-lg overflow-hidden">
                        <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 896px"
                            quality={80}
                            loading="lazy"
                        />
                    </div>
                )}

                <div className="prose prose-lg mx-auto font-body">
                    {post.content}
                </div>
            </div>
        </article>
    );
}
