import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for Footer during Suspense streaming
 * Minimal skeleton that matches Footer height to prevent CLS
 */
export function FooterSkeleton() {
    return (
        <footer className="bg-black text-white border-t border-white/10 relative overflow-hidden">
            <div className="max-w-[1920px] mx-auto px-6 md:px-12 pt-24 pb-12">
                <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 mb-24">
                    {/* Brand Column Skeleton */}
                    <div className="max-w-sm space-y-6">
                        <Skeleton className="h-10 w-32 bg-white/10" />
                        <Skeleton className="h-4 w-full bg-white/10" />
                        <Skeleton className="h-4 w-3/4 bg-white/10" />

                        <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
                            <Skeleton className="h-3 w-20 bg-white/10" />
                            <div className="flex gap-2">
                                <Skeleton className="h-8 flex-1 bg-white/10" />
                                <Skeleton className="h-8 w-8 bg-white/10" />
                            </div>
                        </div>
                    </div>

                    {/* Links Grid Skeleton */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="space-y-6">
                                <Skeleton className="h-3 w-16 bg-white/10" />
                                <div className="space-y-3">
                                    {[...Array(4)].map((_, j) => (
                                        <Skeleton key={j} className="h-4 w-20 bg-white/10" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Bottom Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-8 border-t border-white/5 gap-8">
                    <div className="space-y-4">
                        <div className="flex gap-4">
                            {[...Array(4)].map((_, i) => (
                                <Skeleton key={i} className="h-4 w-4 bg-white/10" />
                            ))}
                        </div>
                        <Skeleton className="h-3 w-48 bg-white/10" />
                    </div>
                    <Skeleton className="h-4 w-24 bg-white/10" />
                </div>
            </div>
        </footer>
    );
}

export default FooterSkeleton;
