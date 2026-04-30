"use client"

import * as React from "react"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import { cn } from "@/lib/utils"

interface MobileProductCardProps {
    product: Product
    isSelected?: boolean
    onSelect?: (selected: boolean) => void
    onActionClick: (product: Product) => void
}

export function MobileProductCard({
    product,
    isSelected,
    onSelect,
    onActionClick,
}: MobileProductCardProps) {
    const formatCurrency = useFormatCurrency()
    const [expanded, setExpanded] = React.useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 border-green-200"
            case "archived":
                return "bg-red-100 text-red-700 border-red-200"
            case "draft":
                return "bg-amber-100 text-amber-700 border-amber-200"
            default:
                return "bg-gray-100 text-gray-600 border-border"
        }
    }

    const getStockColor = (stock: number) => {
        if (stock === 0) return "text-red-600"
        if (stock < 10) return "text-amber-600"
        return "text-gray-600"
    }

    return (
        <div
            className={cn(
                "rounded-xl border border-border bg-white overflow-hidden transition-all shadow-sm",
                isSelected && "ring-2 ring-gray-400"
            )}
        >
            {/* Main Card Content */}
            <div className="p-4">
                <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative flex-shrink-0">
                        {product.cover_image ? (
                            <img
                                src={product.cover_image}
                                alt={product.title}
                                className="w-16 h-16 object-cover rounded-lg border border-border"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg border border-border flex items-center justify-center">
                                <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">{product.title}</h3>
                                <p className="text-gray-500 text-xs font-mono mt-0.5">
                                    {product.sku || "NO SKU"}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0 hover:bg-gray-100 text-gray-500"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onActionClick(product)
                                }}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Price and Status Row */}
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex flex-col">
                                <span className="font-mono text-gray-900 font-medium">
                                    {formatCurrency(product.price)}
                                </span>
                                {product.sale_price && (
                                    <span className="text-green-600 text-xs font-mono">
                                        {formatCurrency(product.sale_price)}
                                    </span>
                                )}
                            </div>
                            <div
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                    getStatusColor(product.status || "draft")
                                )}
                            >
                                {product.status || "draft"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expand Button */}
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                >
                    {expanded ? (
                        <>
                            <span>Hide Details</span>
                            <ChevronUp className="h-4 w-4" />
                        </>
                    ) : (
                        <>
                            <span>Show Details</span>
                            <ChevronDown className="h-4 w-4" />
                        </>
                    )}
                </button>
            </div>

            {/* Expanded Details - CSS Transition */}
            <div
                className={cn(
                    "grid transition-all duration-200 ease-out",
                    expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 space-y-3 border-t border-gray-100">
                        {/* Stock Info - now calculated from variants */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-gray-500 text-sm">Variants</span>
                            <span className="text-gray-600 font-medium">
                                {product.variants?.length ?? 0} variant{(product.variants?.length ?? 0) !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Category Info */}
                        {product.category && (
                            <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-500 text-sm">Category</span>
                                <span className="text-gray-700 text-sm">{product.category}</span>
                            </div>
                        )}

                        {/* Created Date */}
                        {product.created_at && (
                            <div className="flex items-center justify-between py-2 border-t border-gray-100">
                                <span className="text-gray-500 text-sm">Added</span>
                                <span className="text-gray-600 text-sm">
                                    {new Date(product.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}


