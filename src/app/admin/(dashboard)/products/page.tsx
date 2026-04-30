import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import { TableSkeleton } from "@/components/admin/ui/TableSkeleton";
import { ProductTableClient } from "@/components/admin/products/ProductTableClient";

async function ProductsTable({
  searchParams,
}: {
  searchParams?: { page?: string; query?: string };
}) {
  const supabase = await createAdminClient();
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.query || "";
  const limit = 50;
  const offset = (page - 1) * limit;

  // 1. Fetch Paginated Products
  let query = supabase
    .from("products")
    .select(`*, variants:product_variants(*)`, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: products, count } = await query;

  if (!products) return <ProductTableClient products={[]} totalPages={0} currentPage={1} />;

  // 2. Fetch Inventory for Visible Items Only
  const variantIds = products.flatMap((p) => p.variants?.map((v: any) => v.id) || []);
  let inventoryMap: Record<string, number> = {};

  if (variantIds.length > 0) {
    const { data: inventory } = await supabase
      .from("inventory_levels")
      .select("variant_id, available")
      .in("variant_id", variantIds);

    if (inventory) {
      for (const inv of inventory) {
        inventoryMap[inv.variant_id] =
          (inventoryMap[inv.variant_id] || 0) + (inv.available || 0);
      }
    }
  }

  // 3. Merge Data
  const productsWithInventory = products.map((p) => ({
    ...p,
    variants: p.variants?.map((v: any) => ({
      ...v,
      inventory_quantity: inventoryMap[v.id] || 0,
    })),
  }));

  const totalPages = Math.ceil((count || 0) / limit);

  return (
    <ProductTableClient
      products={productsWithInventory}
      totalPages={totalPages}
      currentPage={page}
    />
  );
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; query?: string }>;
}) {
  const resolvedParams = await searchParams;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Products
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your store&apos;s inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">View Shop</span>
          </Link>
          <Button
            asChild
            className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-4 font-medium"
          >
            <Link href="/admin/products/new">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<TableSkeleton rows={8} />}>
        <ProductsTable searchParams={resolvedParams} />
      </Suspense>
    </div>
  );
}


