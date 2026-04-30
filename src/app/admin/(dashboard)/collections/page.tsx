import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";
import { CollectionTableClient } from "@/components/admin/collections/CollectionTableClient";
import { StoreConfigService } from "@/services/config";

async function CollectionsTable({ aspectRatio }: { aspectRatio: number }) {
  const supabase = await createAdminClient();
  const { data: collections } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <CollectionTableClient
      collections={collections || []}
      aspectRatio={aspectRatio}
    />
  );
}

export default async function CollectionsPage() {
  const config = await StoreConfigService.getStoreConfig();
  const aspectRatio = parseFloat(config.categoryGrid?.aspectRatio || "0.8");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Collections
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your store's collections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Store</span>
          </Link>
          <Button
            asChild
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 h-10 font-medium"
          >
            <Link href={`/admin/collections/new?ratio=${aspectRatio}`}>
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Collection</span>
              <span className="sm:hidden">Create</span>
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={6} />}>
        <CollectionsTable aspectRatio={aspectRatio} />
      </Suspense>
    </div>
  );
}

