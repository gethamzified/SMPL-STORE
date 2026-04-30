import { getBlogPostById } from "@/lib/api/blog";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BlogEditor } from "@/components/admin/blog/BlogEditor";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditBlogPage({ params }: PageProps) {
    const { id } = await params;
    const result = await getBlogPostById(id);

    if (result.error || !result.data) {
        notFound();
    }

    const post = result.data;
    const isNew = false; // Assuming for now, as 'isNew' is not defined in the original context

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div>
                <Link
                    href="/admin/blog"
                    className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm mb-4 transition-colors w-fit"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Blog
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-gray-900">
                        {isNew ? 'New Post' : 'Edit Post'}
                    </h1>
                    {post.status === "published" && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700">
                            Published
                        </span>
                    )}
                </div>
            </div>

            <BlogEditor initialPost={post} />
        </div>
    );
}
