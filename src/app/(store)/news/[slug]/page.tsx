import { notFound } from "next/navigation";
import Image from "next/image";
import { getLatestPosts } from "@/lib/theme";
import { createStaticClient } from "@/lib/supabase/static";
import { BlogPost } from "@/lib/types";

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

// Mock function to get a single post - in real app would verify slug
// Since we don't have a direct "getPostBySlug" in theme yet, we simulate or reuse getLatestPosts
async function getPost(slug: string): Promise<BlogPost | undefined> {
    const posts = await getLatestPosts(10);
    const existingPost = posts.find((p: any) => p.slug === slug);

    if (existingPost) return existingPost as BlogPost;

    // Return mock if not found for now to prevent 404s during demo
    // Ensure we match BlogPost interface
    return {
        id: "mock-id-" + slug,
        title: "Sample News Article",
        slug: slug,
        content: "This is a placeholder for the news article content. In a real application, this would claim data from the database.",
        excerpt: "This is a placeholder excerpt.",
        published_at: new Date().toISOString(),
        author_name: "Calder Team",
        featured_image: "https://framerusercontent.com/images/V5a1RpyqOHHGnONdw8R7GjDBIg.jpg",
        tags: ["News"],
        status: "published",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    } as BlogPost;
}

export default async function NewsDetailPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) return notFound();

    return (
        <article className="min-h-screen bg-white pt-32 pb-20 px-6 md:px-12">
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
