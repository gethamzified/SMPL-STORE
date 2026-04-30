"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateBlogPost } from "@/lib/api/blog";
import type { BlogPost } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, Save, Loader2 } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface BlogEditorProps {
    initialPost: BlogPost;
}

export function BlogEditor({ initialPost }: BlogEditorProps) {
    const [post, setPost] = useState(initialPost);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        const result = await updateBlogPost(post.id, {
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt || undefined,
            status: post.status,
            seo_title: post.seo_title || undefined,
            seo_description: post.seo_description || undefined,
            tags: post.tags,
        });
        setLoading(false);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Blog post saved successfully");
            router.refresh();
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-4">
                    <div>
                        <Label className="text-white/50 mb-2 block">Post Title</Label>
                        <Input
                            value={post.title}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white text-lg font-medium"
                            placeholder="Enter post title..."
                        />
                    </div>
                    <div>
                        <Label className="text-white/50 mb-2 block">URL Slug</Label>
                        <Input
                            value={post.slug}
                            onChange={(e) => setPost({ ...post, slug: e.target.value })}
                            className="bg-white/5 border-white/10 text-white font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-4">
                    <div>
                        <Label className="text-white/50 mb-2 block">Excerpt</Label>
                        <Textarea
                            value={post.excerpt || ""}
                            onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                            className="bg-white/5 border-white/10 text-white h-24"
                            placeholder="Brief summary of the post..."
                        />
                    </div>
                    <div>
                        <Label className="text-white/50 mb-2 block">Content (Markdown/HTML)</Label>
                        <Textarea
                            value={post.content || ""}
                            onChange={(e) => setPost({ ...post, content: e.target.value })}
                            className="bg-white/5 border-white/10 text-white min-h-[400px] font-mono text-sm"
                            placeholder="Write your blog post content here..."
                        />
                    </div>
                </div>

                <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-4">
                    <h3 className="text-white font-medium mb-4">SEO Settings</h3>
                    <div>
                        <Label className="text-white/50 mb-2 block">SEO Title</Label>
                        <Input
                            value={post.seo_title || ""}
                            onChange={(e) => setPost({ ...post, seo_title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            placeholder={post.title}
                        />
                    </div>
                    <div>
                        <Label className="text-white/50 mb-2 block">Meta Description</Label>
                        <Textarea
                            value={post.seo_description || ""}
                            onChange={(e) => setPost({ ...post, seo_description: e.target.value })}
                            className="bg-white/5 border-white/10 text-white h-24"
                            placeholder="Description for search engines..."
                        />
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-6 sticky top-24">
                    <div>
                        <Label className="text-white/50 mb-2 block">Status</Label>
                        <Select
                            value={post.status}
                            onValueChange={(value: "draft" | "published" | "archived") =>
                                setPost({ ...post, status: value })
                            }
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-white/50 mb-2 block">Tags (comma separated)</Label>
                        <Input
                            value={post.tags?.join(", ") || ""}
                            onChange={(e) =>
                                setPost({
                                    ...post,
                                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                                })
                            }
                            className="bg-white/5 border-white/10 text-white"
                            placeholder="fashion, style, tips"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/10 space-y-3">
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="w-full bg-white text-black hover:bg-white/90"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            Save Post
                        </Button>

                        {post.status === "published" && (
                            <Button
                                variant="outline"
                                className="w-full border-white/10 text-white hover:bg-white/5"
                                asChild
                            >
                                <a href={`/blog/${post.slug}`} target="_blank">
                                    <Eye className="w-4 h-4 mr-2" /> View Post
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

