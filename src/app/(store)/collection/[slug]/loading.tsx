import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6 md:px-12">

            {/* Breadcrumb Skeleton */}
            <div className="mb-8 hidden md:block">
                <Skeleton className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
                <div className="w-full md:w-2/3 space-y-6">
                    <Skeleton className="h-4 w-32 bg-neutral-200 dark:bg-neutral-800" />
                    <Skeleton className="h-20 w-3/4 max-w-lg bg-neutral-200 dark:bg-neutral-800" />
                    <Skeleton className="h-6 w-1/2 max-w-md bg-neutral-200 dark:bg-neutral-800" />
                </div>
            </div>

            {/* Collection Filter Skeleton */}
            <div className="mb-12 flex gap-3 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                ))}
            </div>

            {/* Full Width Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-8 gap-x-4 md:gap-y-16 md:gap-x-8">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="w-full aspect-[3/4] bg-neutral-200 dark:bg-neutral-800" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
                            <Skeleton className="h-3 w-1/4 bg-neutral-200 dark:bg-neutral-800" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
