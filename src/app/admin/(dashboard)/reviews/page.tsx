import { createAdminClient } from "@/lib/supabase/admin";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";
import { ReviewsTableClient } from "@/components/admin/reviews/ReviewsTableClient";

async function ReviewsTable() {
    const supabase = await createAdminClient();
    const { data: reviews } = await supabase
        .from("reviews")
        .select(`
      *,
      product:products(id, title, slug, cover_image)
    `)
        .order("created_at", { ascending: false });

    return <ReviewsTableClient reviews={reviews || []} />;
}

export default function ReviewsPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Reviews
                    </h1>
                    <p className="text-gray-500 text-sm">
                        Moderate customer reviews before they appear on your store.
                    </p>
                </div>
            </div>

            <Suspense fallback={<TableSkeleton rows={8} />}>
                <ReviewsTable />
            </Suspense>
        </div>
    );
}

