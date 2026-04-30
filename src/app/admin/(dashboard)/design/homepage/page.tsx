import { createAdminClient } from "@/lib/supabase/admin";
import { HomepageBuilderClient } from "./client";
import { HomepageSection } from "@/lib/types";

export default async function HomepageDesignPage() {
    const supabase = await createAdminClient();
    const { data } = await supabase
        .from("site_config")
        .select("value")
        .eq("key", "homepage_layout")
        .single();

    const sections: HomepageSection[] = data?.value || [
        { id: "hero", type: "hero", enabled: true, order: 0 },
        { id: "categories", type: "categories", enabled: true, order: 1 },
        { id: "featured", type: "featured-products", enabled: true, order: 2 },
        { id: "benefits", type: "benefits", enabled: true, order: 3 },
        { id: "news", type: "news", enabled: true, order: 4 },
    ];

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h1 className="text-xl font-semibold text-gray-900">Homepage Layout</h1>
                <p className="text-gray-500 text-sm">Drag to reorder sections or toggle their visibility.</p>
            </div>

            <HomepageBuilderClient initialSections={sections} />
        </div>
    );
}

