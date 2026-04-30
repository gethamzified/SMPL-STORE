import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Edit, Trash2, FileText, Globe, Calendar } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deleteBlogPost, createBlogPost } from "@/lib/api/blog";
import { revalidatePath } from "next/cache";
import Image from "next/image";

export default async function BlogPage() {
    const supabase = await createAdminClient();
    const { data: posts } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

    async function handleCreate() {
        "use server";
        const result = await createBlogPost({
            title: "Untitled Post",
            status: "draft",
        });
        if (result.data) {
            revalidatePath("/admin/blog");
        }
    }

    async function handleDelete(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        await deleteBlogPost(id);
        revalidatePath("/admin/blog");
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Blog
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Create and manage blog posts for your store.
                    </p>
                </div>
                <form action={handleCreate}>
                    <Button
                        type="submit"
                        className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 h-10 font-medium"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        New Post
                    </Button>
                </form>
            </div>

            <div className="border border-border rounded-xl bg-white overflow-hidden shadow-sm overflow-x-auto">
                <Table>
                    <TableHeader className="bg-gray-50/50">
                        <TableRow className="border-gray-100 hover:bg-transparent">
                            <TableHead className="text-gray-500 font-medium px-6 py-4 w-[400px]">
                                Post
                            </TableHead>
                            <TableHead className="text-gray-500 font-medium px-4">
                                Status
                            </TableHead>
                            <TableHead className="text-gray-500 font-medium px-4">
                                Published
                            </TableHead>
                            <TableHead className="text-gray-500 font-medium px-6 text-right">
                                Actions
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <TableRow
                                    key={post.id}
                                    className="border-gray-50 hover:bg-gray-50 transition-colors"
                                >
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {post.featured_image ? (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    <Image
                                                        src={post.featured_image}
                                                        alt={post.title}
                                                        width={48}
                                                        height={48}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-border flex items-center justify-center text-gray-500">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium text-gray-900 block">
                                                    {post.title}
                                                </span>
                                                <span className="text-gray-600 text-xs font-mono">
                                                    /blog/{post.slug}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${post.status === "published"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : post.status === "archived"
                                                    ? "bg-gray-200 text-gray-600"
                                                    : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {post.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-4 text-gray-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {post.published_at
                                                ? formatDate(post.published_at)
                                                : "Not published"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                asChild
                                                className="hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg"
                                            >
                                                <Link href={`/admin/blog/${post.id}`}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            {post.status === "published" && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    asChild
                                                    className="hover:text-emerald-600 hover:bg-emerald-50 text-gray-500 rounded-lg"
                                                >
                                                    <Link href={`/blog/${post.slug}`} target="_blank">
                                                        <Globe className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            )}
                                            <form action={handleDelete}>
                                                <input type="hidden" name="id" value={post.id} />
                                                <Button
                                                    type="submit"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </form>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={4}
                                    className="h-48 text-center text-gray-500 text-sm"
                                >
                                    No blog posts yet. Create your first post!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

