"use client"

import * as React from "react"
import { Order } from "@/lib/types"
import { columns } from "@/components/admin/orders/columns"
import { ResponsiveDataTable } from "@/components/admin/ui/ResponsiveDataTable"
import { MobileOrderCard } from "@/components/admin/orders/MobileOrderCard"
import { ActionDrawer, ActionDrawerAction } from "@/components/admin/ui/ActionDrawer"
import { deleteOrderAction } from "@/app/admin/(dashboard)/orders/actions"
import { useRouter } from "next/navigation"
import { Eye, Trash2, Copy } from "lucide-react"
import { Row } from "@tanstack/react-table"

interface OrderTableClientProps {
    orders: Order[]
}

export function OrderTableClient({ orders }: OrderTableClientProps) {
    const router = useRouter()
    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const handleActionClick = (order: Order) => {
        setSelectedOrder(order)
        setDrawerOpen(true)
    }

    const handleView = () => {
        if (selectedOrder) {
            router.push(`/admin/orders/${selectedOrder.id}`)
        }
    }

    const handleCopy = () => {
        if (selectedOrder) {
            navigator.clipboard.writeText(selectedOrder.id)
        }
    }

    const handleDelete = async () => {
        if (selectedOrder) {
            if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                const result = await deleteOrderAction(selectedOrder.id)
                if (result.success) {
                    router.refresh()
                } else {
                    alert(result.error || 'Failed to delete order')
                }
            }
        }
    }

    const actions: ActionDrawerAction[] = [
        {
            label: "View Details",
            icon: <Eye className="h-5 w-5" />,
            onClick: handleView,
        },
        {
            label: "Copy Order ID",
            icon: <Copy className="h-5 w-5" />,
            onClick: handleCopy,
        },
        {
            label: "Delete Order",
            icon: <Trash2 className="h-5 w-5" />,
            onClick: handleDelete,
            variant: "destructive",
        },
    ]

    const renderMobileCard = (row: Row<Order>) => (
        <MobileOrderCard
            order={row.original}
            onActionClick={handleActionClick}
        />
    )

    return (
        <>
            <ResponsiveDataTable
                columns={columns}
                data={orders}
                filterColumn="email"
                filterPlaceholder="Filter by email..."
                renderMobileCard={renderMobileCard}
            />

            <ActionDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={selectedOrder ? `Order #${selectedOrder.id.slice(0, 8)}` : "Order Actions"}
                description={selectedOrder?.email}
                actions={actions}
            />
        </>
    )
}

