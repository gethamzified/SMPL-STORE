"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Edit } from "lucide-react"
import Image from "next/image"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { deleteProduct } from "@/app/admin/(dashboard)/products/actions"
import { useFormatCurrency } from "@/context/StoreConfigContext"

const PriceCell = ({ amount, saleAmount }: { amount: number, saleAmount?: number | null }) => {
    const formatCurrency = useFormatCurrency();
    return (
        <div className="flex flex-col">
            <span className="font-mono text-gray-900">{formatCurrency(amount)}</span>
            {saleAmount && (
                <span className="text-emerald-600 text-[10px] font-mono">
                    {formatCurrency(saleAmount)}
                </span>
            )}
        </div>
    );
};

export const columns: ColumnDef<Product>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-input data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-input data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "title",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-gray-100 text-gray-500 hover:text-gray-900 pl-0"
                >
                    Product
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const product = row.original;
            return (
                <div className="flex items-center gap-4">
                    {product.cover_image ? (
                        <Image src={product.cover_image} alt={product.title} width={40} height={40} sizes="40px" quality={75} className="w-10 h-10 object-cover rounded-lg border border-border" />
                    ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-lg border border-border flex items-center justify-center">
                            <span className="text-gray-400 text-[10px]">Img</span>
                        </div>
                    )}
                    <div>
                        <span className="font-medium text-gray-900 block truncate max-w-[200px]">{product.title}</span>
                        <span className="text-gray-500 text-[10px] font-mono">{product.sku || 'NO SKU'}</span>
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"))
            const salePrice = row.original.sale_price;

            return <PriceCell amount={price} saleAmount={salePrice} />
        },
    },
    {
        accessorKey: "variants",
        header: () => <div className="text-center">Variants</div>,
        cell: ({ row }) => {
            const variants = row.original.variants as any[] | undefined;
            const count = variants?.length ?? 0;
            return <div className="text-center font-mono text-gray-600">{count}</div>
        }
    },
    {
        accessorKey: "status",
        header: () => <div className="text-center">Status</div>,
        cell: ({ row }) => {
            const status = row.getValue<string>("status") || 'draft';
            let color = "bg-gray-100 text-gray-600 border-border";
            if (status === 'active') color = "bg-green-100 text-green-700 border-green-200";
            if (status === 'archived') color = "bg-red-100 text-red-700 border-red-200";
            if (status === 'draft') color = "bg-amber-100 text-amber-700 border-amber-200";

            return (
                <div className="flex justify-center">
                    <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${color} uppercase tracking-wider`}>
                        {status}
                    </div>
                </div>
            )
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const product = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-border">
                        <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(product.id)}
                            className="text-gray-700 focus:bg-gray-100"
                        >
                            Copy Product ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem className="text-gray-700 focus:bg-gray-100" asChild>
                            <Link href={`/admin/products/${product.id}`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Product
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-600"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
                                    const result = await deleteProduct(product.id);
                                    if ('message' in result) {
                                        window.location.reload();
                                    } else {
                                        alert(result.error || 'Failed to delete product');
                                    }
                                }
                            }}
                        >
                            Delete Product
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]


