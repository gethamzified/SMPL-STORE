import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import MenuBuilder from "@/components/admin/navigation/MenuBuilder";
import { MenuItem } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditMenuPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createAdminClient();

    const { data: menu } = await supabase
        .from("navigation_menus")
        .select("*")
        .eq("id", id)
        .single();

    if (!menu) {
        notFound();
    }

    // Ensure items is typed correctly
    const items = (menu.items || []) as MenuItem[];

    return (
        <div className="space-y-8">
            <div>
                <Link href="/admin/navigation" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 text-sm mb-4 transition-colors w-fit">
                    <ArrowLeft className="w-4 h-4" /> Back to Navigation
                </Link>
                <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Edit Menu</h2>
                <p className="text-gray-500 text-sm">Configure links and hierarchy for this menu.</p>
            </div>

            <MenuBuilder
                initialMenu={{
                    ...menu,
                    items
                }}
            />
        </div>
    );
}
