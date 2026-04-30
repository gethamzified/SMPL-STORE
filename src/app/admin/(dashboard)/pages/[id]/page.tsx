import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import PageBuilder from "@/components/admin/pages/PageBuilder";
import { Page } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPagePage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: page } = await supabase
        .from("pages")
        .select("*")
        .eq("id", id)
        .single();

    if (!page) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <Link href="/admin/pages" className="text-white/40 hover:text-white flex items-center gap-2 text-sm mb-4 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Pages
                </Link>
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-white">Edit Page</h2>
                    <span className="text-white/30 text-sm font-mono">/{page.slug}</span>
                </div>
            </div>

            <PageBuilder initialPage={page as Page} />
        </div>
    );
}
