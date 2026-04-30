"use client"

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MobileCollectionCard } from "./MobileCollectionCard";
import { GripVertical } from "lucide-react";

interface SortableMobileCardProps {
    collection: any;
    aspectRatio: number;
    onActionClick: (collection: any) => void;
}

export function SortableMobileCard({
    collection,
    aspectRatio,
    onActionClick,
}: SortableMobileCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: collection.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.9 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative touch-none">
            {/* Drag Handle - Absolute positioned on the left/top */}
            <div
                {...attributes}
                {...listeners}
                className="absolute left-2 top-[32px] -translate-y-1/2 z-20 p-2 text-muted-foreground/50 active:text-foreground cursor-grab active:cursor-grabbing"
            >
                <GripVertical className="h-5 w-5" />
            </div>

            {/* Padding left to make room for handle */}
            <div className="pl-8">
                <MobileCollectionCard
                    collection={collection}
                    aspectRatio={aspectRatio}
                    onActionClick={onActionClick}
                />
            </div>
        </div>
    );
}
