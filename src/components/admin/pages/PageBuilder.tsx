'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updatePage } from '@/app/admin/(dashboard)/pages/actions';
import { Page } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from "sonner";
import { Eye } from 'lucide-react';

interface PageBuilderProps {
    initialPage: Page;
}

export default function PageBuilder({ initialPage }: PageBuilderProps) {
    const [page, setPage] = useState(initialPage);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        const res = await updatePage(page.id, {
            title: page.title,
            slug: page.slug,
            content: page.content,
            is_published: page.is_published,
            seo_title: page.seo_title,
            seo_description: page.seo_description
        });
        setLoading(false);

        if (res?.error) {
            toast.error(res.error);
        } else {
            toast.success('Page saved successfully');
            router.refresh();
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-4">
                        <div>
                            <Label className="text-white/50 mb-2 block">Page Title</Label>
                            <Input
                                value={page.title}
                                onChange={(e) => setPage({ ...page, title: e.target.value })}
                                className="bg-white/5 border-white/10 text-white text-lg font-medium"
                            />
                        </div>
                        <div>
                            <Label className="text-white/50 mb-2 block">Content (HTML/Markdown)</Label>
                            <Textarea
                                value={page.content || ''}
                                onChange={(e) => setPage({ ...page, content: e.target.value })}
                                className="bg-white/5 border-white/10 text-white min-h-[400px] font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-4">
                        <h3 className="text-white font-medium mb-4">SEO Settings</h3>
                        <div>
                            <Label className="text-white/50 mb-2 block">SEO Title</Label>
                            <Input
                                value={page.seo_title || ''}
                                onChange={(e) => setPage({ ...page, seo_title: e.target.value })}
                                className="bg-white/5 border-white/10 text-white"
                                placeholder={page.title}
                            />
                        </div>
                        <div>
                            <Label className="text-white/50 mb-2 block">Meta Description</Label>
                            <Textarea
                                value={page.seo_description || ''}
                                onChange={(e) => setPage({ ...page, seo_description: e.target.value })}
                                className="bg-white/5 border-white/10 text-white h-24"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    <div className="bg-[#0A0A0A] p-6 border border-white/10 rounded-xl space-y-6">
                        <div>
                            <Label className="text-white/50 mb-2 block">URL Slug</Label>
                            <Input
                                value={page.slug}
                                onChange={(e) => setPage({ ...page, slug: e.target.value })}
                                className="bg-white/5 border-white/10 text-white font-mono text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label className="text-white">Published</Label>
                            <Switch
                                checked={page.is_published}
                                onCheckedChange={(checked) => setPage({ ...page, is_published: checked })}
                            />
                        </div>

                        <div className="pt-4 border-t border-white/10">
                            <Button onClick={handleSave} disabled={loading} className="w-full bg-white text-black hover:bg-white/90">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>

                    {page.is_published && (
                        <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5" asChild>
                            <a href={`/${page.slug}`} target="_blank">
                                <Eye className="w-4 h-4 mr-2" /> View Live Page
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

