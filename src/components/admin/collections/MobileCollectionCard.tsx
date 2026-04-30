"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

interface Collection {
    id: string
    title: string
    slug: string
    image_url?: string | null
    is_visible: boolean
    sort_order?: number
}

interface MobileCollectionCardProps {
    collection: Collection
    aspectRatio: number
    onActionClick: (collection: Collection) => void
}

export function MobileCollectionCard({
    collection,
    aspectRatio,
    onActionClick,
}: MobileCollectionCardProps) {
    return (
        <div className="rounded-xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl overflow-hidden">
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Collection Image */}
                    <div className="relative flex-shrink-0 rounded-lg overflow-hidden border border-white/10">
                        {collection.image_url ? (
                            <img
                                src={collection.image_url}
                                alt={collection.title}
                                className="object-cover"
                                style={{ width: 64, height: Math.round(64 / aspectRatio) }}
                            />
                        ) : (
                            <div
                                className="bg-white/5 flex items-center justify-center text-white/20 text-xs"
                                style={{ width: 64, height: Math.round(64 / aspectRatio) }}
                            >
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Collection Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-medium text-white truncate">{collection.title}</h3>
                                <p className="text-white/40 text-xs font-mono mt-0.5">/{collection.slug}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 hover:bg-white/10 text-white/60"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onActionClick(collection)
                                }}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Status Row */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                {collection.is_visible ? (
                                    <>
                                        <Eye className="h-3 w-3 text-emerald-400" />
                                        <span className="text-emerald-400 text-xs">Visible</span>
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="h-3 w-3 text-white/40" />
                                        <span className="text-white/40 text-xs">Hidden</span>
                                    </>
                                )}
                            </div>
                            <span className="text-white/40 text-xs font-mono">
                                Order: {collection.sort_order ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

