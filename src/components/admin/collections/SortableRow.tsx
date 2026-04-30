"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TableRow, TableCell } from "@/components/ui/table";
import { GripVertical } from "lucide-react";
import { flexRender, Row } from "@tanstack/react-table";

interface SortableRowProps {
    row: Row<any>;
}

export function SortableRow({ row }: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.original.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={`transition-colors ${isDragging ? "bg-muted" : "hover:bg-muted/50"}`}
        >
            {/* Drag Handle Column */}
            <TableCell className="w-[50px] px-0 py-4 text-center">
                <button
                    {...attributes}
                    {...listeners}
                    className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-foreground touch-none"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            </TableCell>

            {/* Render other cells */}
            {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="px-6 py-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
            ))}
        </TableRow>
    );
}
