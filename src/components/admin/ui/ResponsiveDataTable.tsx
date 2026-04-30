"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Row,
} from "@tanstack/react-table"
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useIsDesktop } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useRouter, useSearchParams } from "next/navigation"

interface ResponsiveDataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    filterColumn?: string
    filterPlaceholder?: string
    // For mobile view, render a custom card component
    renderMobileCard?: (row: Row<TData>) => React.ReactNode
    // Optional loading state
    isLoading?: boolean
    // Server-side pagination
    currentPage?: number
    totalPages?: number
}

export function ResponsiveDataTable<TData, TValue>({
    columns,
    data,
    filterColumn = "title",
    filterPlaceholder = "Filter...",
    renderMobileCard,
    currentPage,
    totalPages,
}: ResponsiveDataTableProps<TData, TValue>) {
    const isDesktop = useIsDesktop()
    const router = useRouter()
    const searchParams = useSearchParams()

    // ... existing table state ...
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
        manualPagination: !!totalPages, // Enable manual pagination if server-side props exist
        pageCount: totalPages ?? -1,
    })

    // Handle Page Change
    const handlePageChange = (newPage: number) => {
        if (totalPages) {
            const params = new URLSearchParams(searchParams.toString())
            params.set("page", newPage.toString())
            router.push(`?${params.toString()}`)
        } else {
            table.setPageIndex(newPage - 1)
        }
    }

    // ... rest of render ...

    return (
        <div className="w-full space-y-4">
            {/* ... Filter Bar ... */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center flex-1 gap-2">
                    <div className="relative max-w-sm w-full">
                        <Input
                            placeholder={filterPlaceholder}
                            value={(table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""}
                            onChange={(event) => {
                                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
                                // Optional: Debounced server search could go here
                            }}
                            className="bg-white border border-input rounded-lg h-10 text-gray-900 placeholder:text-gray-500 focus:ring-1 focus:ring-ring transition-all"
                        />
                    </div>
                </div>
                {isDesktop && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white border border-input rounded-lg h-10 text-gray-900 hover:bg-gray-100 hover:text-black font-medium transition-all">
                                <SlidersHorizontal className="mr-2 h-4 w-4" />
                                View
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white border-border">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize text-gray-700 focus:bg-gray-100"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Desktop: Table View */}
            {isDesktop ? (
                <div className="rounded-xl border border-border bg-white shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-gray-50 border-b border-border sticky top-0 z-10">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                                        {headerGroup.headers.map((header, index) => {
                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    className={cn(
                                                        "text-gray-500 font-medium h-12",
                                                        // First column (after checkbox) is sticky
                                                        index === 1 && "sticky left-0 bg-gray-50 z-[5]"
                                                    )}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            )
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            data-state={row.getIsSelected() && "selected"}
                                            className="border-gray-100 hover:bg-gray-50 transition-colors group"
                                        >
                                            {row.getVisibleCells().map((cell, index) => (
                                                <TableCell
                                                    key={cell.id}
                                                    className={cn(
                                                        "text-gray-700 py-3",
                                                        // First column (after checkbox) is sticky
                                                        index === 1 && "sticky left-0 bg-white z-[5] group-hover:bg-gray-50"
                                                    )}
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef.cell,
                                                        cell.getContext()
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-24 text-center text-gray-500"
                                        >
                                            No results.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ) : (
                /* Mobile: Card View */
                <div className="space-y-3">
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <div key={row.id}>
                                {renderMobileCard ? (
                                    renderMobileCard(row)
                                ) : (
                                    // Fallback if no custom card renderer provided
                                    <div className="rounded-xl border border-border bg-white p-4">
                                        <p className="text-gray-500 text-sm">
                                            No mobile card renderer provided
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-xl border border-border bg-white p-8 text-center text-gray-500">
                            No results.
                        </div>
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="text-sm text-gray-500 order-2 md:order-1">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="flex items-center gap-2 order-1 md:order-2 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-sm text-gray-500 hidden md:block">
                        Page {totalPages ? currentPage : table.getState().pagination.pageIndex + 1} of{" "}
                        {totalPages || table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages ? (currentPage || 1) - 1 : table.getState().pagination.pageIndex)}
                            disabled={totalPages ? (currentPage || 1) <= 1 : !table.getCanPreviousPage()}
                            className="bg-white border border-border rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-all disabled:opacity-30"
                        >
                            <ChevronLeft className="h-4 w-4 md:mr-1" />
                            <span className="hidden md:inline">Previous</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(totalPages ? (currentPage || 1) + 1 : table.getState().pagination.pageIndex + 2)}
                            disabled={totalPages ? (currentPage || 1) >= (totalPages || 1) : !table.getCanNextPage()}
                            className="bg-white border border-border rounded-lg text-gray-900 font-medium hover:bg-gray-100 transition-all disabled:opacity-30"
                        >
                            <span className="hidden md:inline">Next</span>
                            <ChevronRight className="h-4 w-4 md:ml-1" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

