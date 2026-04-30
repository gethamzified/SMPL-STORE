"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Order } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import { useFormatCurrency } from "@/context/StoreConfigContext"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const CurrencyValue = ({ amount }: { amount: number }) => {
    const formatCurrency = useFormatCurrency();
    return <>{formatCurrency(amount)}</>;
};

export const columns: ColumnDef<Order>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="border-gray-400 data-[state=checked]:bg-black data-[state=checked]:text-white border-2 rounded-sm"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="border-gray-400 data-[state=checked]:bg-black data-[state=checked]:text-white border-2 rounded-sm"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Order ID",
        cell: ({ row }) => <div className="font-mono text-xs uppercase text-gray-900 font-medium">#{row.getValue<string>("id").slice(0, 8)}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="hover:bg-gray-100 text-gray-700 hover:text-black"
                >
                    Customer
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <div className="lowercase text-gray-900">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue<string>("status")
            let color = "bg-gray-100 text-gray-600 border-border";
            if (status === 'delivered') color = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (status === 'shipped') color = "bg-blue-50 text-blue-700 border-blue-200";
            if (status === 'processing') color = "bg-amber-50 text-amber-700 border-amber-200";
            if (status === 'cancelled') color = "bg-red-50 text-red-700 border-red-200";

            return (
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${color} uppercase tracking-wide`}>
                    {status}
                </div>
            )
        },
    },
    {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => {
            const status = row.getValue<string>("payment_status")
            const method = row.original.payment_method || 'card'

            let color = "bg-gray-100 text-gray-600 border-border";
            if (status === 'paid') color = "bg-emerald-50 text-emerald-700 border-emerald-200";
            if (status === 'pending_verification') color = "bg-amber-50 text-amber-700 border-amber-200";
            if (status === 'cod_pending') color = "bg-blue-50 text-blue-700 border-blue-200";

            return (
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase text-gray-500 tracking-wider font-mono">{method.replace('_', ' ')}</span>
                    <div className={`w-fit inline-flex items-center px-2 py-0.5 rounded-sm text-[9px] font-medium border ${color} uppercase tracking-wide`}>
                        {status.replace('_', ' ')}
                    </div>
                </div>
            )
        },
    },
    {
        accessorKey: "total",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("total"))
            return (
                <div className="text-right font-mono font-medium">
                    <CurrencyValue amount={amount} />
                </div>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => <div className="text-right">Date</div>,
        cell: ({ row }) => {
            return <div className="text-right text-xs text-gray-500">{new Date(row.getValue("created_at")).toLocaleDateString()}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const order = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500 hover:text-black">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white border-2 border-black rounded-lg shadow-none">
                        <DropdownMenuLabel className="text-gray-900">Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(order.id)} className="text-gray-700 focus:bg-gray-100 focus:text-black cursor-pointer">
                            Copy Order ID
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem className="text-gray-700 focus:bg-gray-100 focus:text-black cursor-pointer" asChild>
                            <Link href={`/admin/orders/${order.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100" />
                        <DropdownMenuItem
                            className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                    const { deleteOrderAction } = await import('@/app/admin/(dashboard)/orders/actions');
                                    const result = await deleteOrderAction(order.id);
                                    if (result.success) {
                                        window.location.reload();
                                    } else {
                                        alert(result.error || 'Failed to delete order');
                                    }
                                }
                            }}
                        >
                            Delete Order
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]

