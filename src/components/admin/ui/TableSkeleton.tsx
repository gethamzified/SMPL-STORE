"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface TableSkeletonProps {
    rows?: number
    columns?: number
    className?: string
    showHeader?: boolean
}

export function TableSkeleton({
    rows = 5,
    columns = 5,
    className,
    showHeader = true,
}: TableSkeletonProps) {
    return (
        <div className={cn("w-full space-y-4", className)}>
            {/* Filter Bar Skeleton */}
            <div className="flex items-center justify-between gap-4">
                <Skeleton className="h-10 w-72 bg-white/5" />
                <Skeleton className="h-10 w-24 bg-white/5" />
            </div>

            {/* Table Skeleton */}
            <div className="rounded-xl border border-white/10 bg-neutral-900/40 overflow-hidden">
                {/* Header */}
                {showHeader && (
                    <div className="bg-white/5 border-b border-white/5 p-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-4 w-4 rounded bg-white/10" />
                            {Array.from({ length: columns - 1 }).map((_, i) => (
                                <Skeleton
                                    key={i}
                                    className={cn(
                                        "h-4 bg-white/10",
                                        i === 0 ? "w-48" : i === columns - 2 ? "w-20" : "w-24"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Rows */}
                <div className="divide-y divide-white/5">
                    {Array.from({ length: rows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-4 rounded bg-white/10" />
                                <div className="flex items-center gap-3 flex-1">
                                    <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-4 w-32 bg-white/10" />
                                        <Skeleton className="h-3 w-20 bg-white/5" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-20 bg-white/10" />
                                <Skeleton className="h-4 w-12 bg-white/10" />
                                <Skeleton className="h-6 w-16 rounded-full bg-white/10" />
                                <Skeleton className="h-8 w-8 rounded bg-white/10" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-40 bg-white/5" />
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-20 bg-white/5" />
                    <Skeleton className="h-9 w-16 bg-white/5" />
                </div>
            </div>
        </div>
    )
}

