import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Product Grid section during Suspense streaming
 * Matches ProductGridSection layout without JS
 */
export function ProductGridSkeleton() {
    return (
        <section className="relative w-full bg-background animate-pulse">
            <div className="border-y border-border py-5 md:py-6 flex justify-center">
                <Skeleton className="h-8 w-56 rounded-none" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-3 md:px-6 py-4 md:py-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="aspect-[2/3] w-full rounded-none" />
                        <Skeleton className="h-4 w-3/4 rounded-none" />
                        <Skeleton className="h-4 w-1/3 rounded-none" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default ProductGridSkeleton;
