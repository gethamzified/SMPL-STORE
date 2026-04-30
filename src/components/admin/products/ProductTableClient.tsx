"use client"

import * as React from "react"
import { Product } from "@/lib/types"
import { columns } from "@/components/admin/products/columns"
import { ResponsiveDataTable } from "@/components/admin/ui/ResponsiveDataTable"
import { MobileProductCard } from "@/components/admin/products/MobileProductCard"
import { ActionDrawer, ActionDrawerAction } from "@/components/admin/ui/ActionDrawer"
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions"
import { useRouter } from "next/navigation"
import { Edit, Trash2, Copy } from "lucide-react"
import { Row } from "@tanstack/react-table"

interface ProductTableClientProps {
    products: Product[]
}

export function ProductTableClient({ products, currentPage = 1, totalPages = 1 }: ProductTableClientProps & { currentPage?: number; totalPages?: number }) {
    const router = useRouter()
    const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)

    const handleActionClick = (product: Product) => {
        setSelectedProduct(product)
        setDrawerOpen(true)
    }

    const handleEdit = () => {
        if (selectedProduct) {
            router.push(`/admin/products/${selectedProduct.id}`)
        }
    }

    const handleCopy = () => {
        if (selectedProduct) {
            navigator.clipboard.writeText(selectedProduct.id)
        }
    }

    const handleDelete = async () => {
        if (selectedProduct) {
            if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                const result = await deleteProduct(selectedProduct.id)
                if ('message' in result) {
                    router.refresh()
                } else {
                    alert(result.error || 'Failed to delete product')
                }
            }
        }
    }

    const actions: ActionDrawerAction[] = [
        {
            label: "Edit Product",
            icon: <Edit className="h-5 w-5" />,
            onClick: handleEdit,
        },
        {
            label: "Copy Product ID",
            icon: <Copy className="h-5 w-5" />,
            onClick: handleCopy,
        },
        {
            label: "Delete Product",
            icon: <Trash2 className="h-5 w-5" />,
            onClick: handleDelete,
            variant: "destructive",
        },
    ]

    const renderMobileCard = (row: Row<Product>) => (
        <MobileProductCard
            product={row.original}
            isSelected={row.getIsSelected()}
            onSelect={(selected) => row.toggleSelected(selected)}
            onActionClick={handleActionClick}
        />
    )

    return (
        <>
            <ResponsiveDataTable
                columns={columns}
                data={products}
                filterColumn="title"
                filterPlaceholder="Filter products..."
                renderMobileCard={renderMobileCard}
                currentPage={currentPage}
                totalPages={totalPages}
            />

            <ActionDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={selectedProduct?.title || "Product Actions"}
                description={selectedProduct?.sku ? `SKU: ${selectedProduct.sku}` : undefined}
                actions={actions}
            />
        </>
    )
}

