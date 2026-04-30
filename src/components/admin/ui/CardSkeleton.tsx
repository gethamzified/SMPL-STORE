"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface CardSkeletonProps {
    count?: number
    className?: string
}

export function CardSkeleton({ count = 5, className }: CardSkeletonProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {/* Filter Skeleton */}
            <Skeleton className="h-10 w-full bg-white/5" />

            {/* Cards */}
            {Array.from({ length: count }).map((_, index) => (
                <div
                    key={index}
                    className="rounded-xl border border-white/10 bg-neutral-900/40 p-4"
                >
                    <div className="flex gap-4">
                        {/* Image Skeleton */}
                        <Skeleton className="h-16 w-16 rounded-lg bg-white/10 flex-shrink-0" />

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-36 bg-white/10" />
                                    <Skeleton className="h-3 w-20 bg-white/5" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded bg-white/10" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24 bg-white/10" />
                                    <Skeleton className="h-3 w-16 bg-white/5" />
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                            </div>
                        </div>
                    </div>

                    {/* Expand Button Skeleton */}
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-center">
                        <Skeleton className="h-4 w-24 bg-white/5" />
                    </div>
                </div>
            ))}
        </div>
    )
}

