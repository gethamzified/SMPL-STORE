import { Skeleton } from "@/components/ui/skeleton";

/**
 * Store-level loading state for page navigations within the store.
 * Shows a subtle skeleton instead of the aggressive full-screen root loader.
 * Matches Shopify's approach: preserve layout shell, animate content areas.
 */
export default function StoreLoading() {
    return (
        <div className="w-full min-h-screen">
            {/* Hero skeleton — matches HeroSection dimensions */}
            <div className="relative w-full h-[100vh] bg-neutral-100">
                <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            </div>

            {/* Content skeleton */}
            <div className="max-w-7xl mx-auto px-6 py-16 space-y-12">
                <div className="flex flex-col items-center gap-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="aspect-[3/4] w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
