"use client"

import * as React from "react"
import { Order } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ChevronDown, ChevronUp, Package } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import { cn } from "@/lib/utils"

interface MobileOrderCardProps {
    order: Order
    onActionClick: (order: Order) => void
}

export function MobileOrderCard({ order, onActionClick }: MobileOrderCardProps) {
    const formatCurrency = useFormatCurrency()
    const [expanded, setExpanded] = React.useState(false)

    const getStatusColor = (status: string) => {
        switch (status) {
            case "delivered":
                return "bg-green-100 text-green-700 border-green-200"
            case "shipped":
                return "bg-blue-100 text-blue-700 border-blue-200"
            case "processing":
                return "bg-amber-100 text-amber-700 border-amber-200"
            case "cancelled":
                return "bg-red-100 text-red-700 border-red-200"
            default:
                return "bg-gray-100 text-gray-600 border-border"
        }
    }

    return (
        <div className="rounded-xl border border-border bg-white overflow-hidden shadow-sm">
            <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs text-gray-500">
                                #{order.id.slice(0, 8)}
                            </span>
                            <div
                                className={cn(
                                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                                    getStatusColor(order.status || "pending")
                                )}
                            >
                                {order.status || "pending"}
                            </div>
                        </div>
                        <p className="text-gray-900 font-medium truncate">{order.email}</p>
                        <p className="text-gray-500 text-xs mt-1">
                            {new Date(order.created_at).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-gray-900">
                            {formatCurrency(order.total)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-100 text-gray-500"
                            onClick={(e) => {
                                e.stopPropagation()
                                onActionClick(order)
                            }}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
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
                            <span>View Items</span>
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
                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <div className="py-2">
                                <span className="text-gray-500 text-xs block mb-1">Shipping To</span>
                                <span className="text-gray-700 text-sm">
                                    {typeof order.shipping_address === 'object'
                                        ? `${(order.shipping_address as any).city || ''}, ${(order.shipping_address as any).country || ''}`
                                        : String(order.shipping_address)
                                    }
                                </span>
                            </div>
                        )}

                        {/* Items Preview */}
                        {order.items && Array.isArray(order.items) && order.items.length > 0 && (
                            <div className="py-2 border-t border-gray-100">
                                <span className="text-gray-500 text-xs block mb-2">Items ({order.items.length})</span>
                                <div className="space-y-2">
                                    {order.items.slice(0, 3).map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span className="text-gray-700 text-sm flex-1 truncate">
                                                {item.title || item.product_title || 'Product'}
                                            </span>
                                            <span className="text-gray-500 text-xs">×{item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 3 && (
                                        <p className="text-gray-500 text-xs">+{order.items.length - 3} more items</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
