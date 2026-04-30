"use client"

import * as React from "react"
import Link from "next/link"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Eye, EyeOff, Loader2 } from "lucide-react"
import { deleteCollection, reorderCollections } from "@/app/admin/(dashboard)/collections/actions"
import { useRouter } from "next/navigation"
import { useIsDesktop } from "@/hooks/use-media-query"
import { ActionDrawer, ActionDrawerAction } from "@/components/admin/ui/ActionDrawer"
import { Trash2, Copy } from "lucide-react"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableRow } from "@/components/admin/collections/SortableRow"
import { SortableMobileCard } from "@/components/admin/collections/SortableMobileCard"
import { toast } from "sonner"

interface Collection {
    id: string
    title: string
    slug: string
    image_url?: string | null
    is_visible: boolean
    sort_order?: number
}

interface CollectionTableClientProps {
    collections: Collection[]
    aspectRatio: number
}

export function CollectionTableClient({ collections: initialCollections, aspectRatio }: CollectionTableClientProps) {
    const router = useRouter()
    const isDesktop = useIsDesktop()
    const [collections, setCollections] = React.useState(initialCollections)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [selectedCollection, setSelectedCollection] = React.useState<Collection | null>(null)
    const [drawerOpen, setDrawerOpen] = React.useState(false)
    const [isSavingOrder, setIsSavingOrder] = React.useState(false)
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Sync state with props when props change (e.g. after server revalidation)
    React.useEffect(() => {
        setCollections(initialCollections)
    }, [initialCollections])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement to start drag (prevents accidental drags on click)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = collections.findIndex((item) => item.id === active.id);
            const newIndex = collections.findIndex((item) => item.id === over?.id);

            const newOrder = arrayMove(collections, oldIndex, newIndex);

            // Optimistic update
            setCollections(newOrder);

            // Trigger server save
            saveOrder(newOrder);
        }
    }

    const saveOrder = React.useCallback(async (newOrder: Collection[]) => {
        setIsSavingOrder(true);
        try {
            // Create payload: only strictly necessary data
            const payload = newOrder.map((item, index) => ({
                id: item.id,
                sort_order: index
            }));

            await reorderCollections(payload);
            toast.success("Order saved");
        } catch (error) {
            toast.error("Failed to save order");
            // Revert state if needed (refetching from server via router.refresh usually easiest)
            router.refresh();
        } finally {
            setIsSavingOrder(false);
        }
    }, [router]);

    const columns: ColumnDef<Collection>[] = [
        {
            id: "drag-handle",
            header: "",
            cell: ({ row }) => null, // Handled in SortableRow
            size: 50,
        },
        {
            accessorKey: "title",
            header: "Collection",
            cell: ({ row }) => {
                const col = row.original
                return (
                    <div className="flex items-center gap-4">
                        {col.image_url ? (
                            <img
                                src={col.image_url}
                                alt={col.title}
                                className="object-cover rounded-md border"
                                style={{ width: 48, height: Math.round(48 / aspectRatio) }}
                            />
                        ) : (
                            <div
                                className="bg-muted rounded-md border"
                                style={{ width: 48, height: Math.round(48 / aspectRatio) }}
                            />
                        )}
                        <span className="font-medium">{col.title}</span>
                    </div>
                )
            },
        },
        {
            accessorKey: "slug",
            header: "Slug",
            cell: ({ row }) => (
                <span className="text-muted-foreground text-sm font-mono">{row.original.slug}</span>
            ),
        },
        {
            accessorKey: "is_visible",
            header: "Visibility",
            cell: ({ row }) => {
                const col = row.original
                return col.is_visible ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Eye className="h-3 w-3 mr-1" /> Visible
                    </span>
                ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border">
                        <EyeOff className="h-3 w-3 mr-1" /> Hidden
                    </span>
                )
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const col = row.original
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <Link href={`/admin/collections/${col.id}?ratio=${aspectRatio}`}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                    onClick={async () => {
                                        if (confirm('Delete this collection?')) {
                                            await deleteCollection(col.id)
                                            router.refresh()
                                        }
                                    }}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    const table = useReactTable({
        data: collections,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    })

    const handleActionClick = (collection: Collection) => {
        setSelectedCollection(collection)
        setDrawerOpen(true)
    }

    const actions: ActionDrawerAction[] = [
        {
            label: "Edit Collection",
            icon: <Edit className="h-5 w-5" />,
            onClick: () => {
                if (selectedCollection) {
                    router.push(`/admin/collections/${selectedCollection.id}?ratio=${aspectRatio}`)
                }
            },
        },
        {
            label: "Copy Collection ID",
            icon: <Copy className="h-5 w-5" />,
            onClick: () => {
                if (selectedCollection) {
                    navigator.clipboard.writeText(selectedCollection.id)
                }
            },
        },
        {
            label: "Delete Collection",
            icon: <Trash2 className="h-5 w-5" />,
            onClick: async () => {
                if (selectedCollection && confirm('Delete this collection?')) {
                    await deleteCollection(selectedCollection.id)
                    router.refresh()
                }
            },
            variant: "destructive",
        },
    ]

    if (!mounted) {
        return null;
    }

    return (
        <DndContext
            id="collections-dnd-context"
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <Input
                        placeholder="Filter collections..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(e) => table.getColumn("title")?.setFilterValue(e.target.value)}
                        className="max-w-sm"
                    />
                    {isSavingOrder && <div className="text-muted-foreground text-sm flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Saving order...</div>}
                </div>

                {isDesktop ? (
                    <div className="border rounded-md overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="font-medium px-6 py-4">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                <SortableContext
                                    items={collections.map(c => c.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <SortableRow key={row.original.id} row={row} />
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={columns.length} className="h-48 text-center text-white/30 text-sm">
                                                No collections created yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </SortableContext>
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="space-y-3 pl-8 relative">
                        {/* Padding left for drag handles which are absolutely positioned in SortableMobileCard */}
                        <SortableContext
                            items={collections.map(c => c.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {collections.length > 0 ? (
                                collections.map((col) => (
                                    <SortableMobileCard
                                        key={col.id}
                                        collection={col}
                                        aspectRatio={aspectRatio}
                                        onActionClick={handleActionClick}
                                    />
                                ))
                            ) : (
                                <div className="rounded-xl border border-white/10 bg-neutral-900/40 p-8 text-center text-white/30 text-sm ml-[-2rem]">
                                    No collections created yet.
                                </div>
                            )}
                        </SortableContext>
                    </div>
                )}
            </div>

            <ActionDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                title={selectedCollection?.title || "Collection Actions"}
                description={selectedCollection ? `/${selectedCollection.slug}` : undefined}
                actions={actions}
            />
        </DndContext>
    )
}

