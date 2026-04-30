"use client";

import { useState } from "react";
import { HomepageSection } from "@/lib/types";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Switch } from "@/components/ui/switch";
import { GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateHomepageLayout } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface HomepageBuilderClientProps {
    initialSections: HomepageSection[];
}

function SortableItem({ section, toggleSection }: { section: HomepageSection, toggleSection: (id: string, enabled: boolean) => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between p-4 bg-white border border-border rounded-xl select-none shadow-sm transition-all",
                isDragging ? "opacity-90 shadow-lg scale-[1.02] border-primary" : "hover:border-input",
                !section.enabled && "opacity-50 bg-gray-50"
            )}
        >
            <div className="flex items-center gap-4">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded text-gray-400"
                >
                    <GripVertical className="bg-transparent" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-900 capitalize">{section.id.replace('-', ' ')}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5 uppercase tracking-wider">{section.type}</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{section.enabled ? "Visible" : "Hidden"}</span>
                    <Switch
                        checked={section.enabled}
                        onCheckedChange={(checked) => toggleSection(section.id, checked)}
                    />
                </div>
            </div>
        </div>
    );
}

export function HomepageBuilderClient({ initialSections }: HomepageBuilderClientProps) {
    const [sections, setSections] = useState(initialSections);
    const [isSaving, setIsSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSections((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const toastId = toast.loading('Saving layout...');
        const orderedSections = sections.map((s, i) => ({ ...s, order: i }));
        const result = await updateHomepageLayout(orderedSections);
        setIsSaving(false);

        if (result.success) {
            toast.success("Homepage layout saved", { id: toastId });
        } else {
            toast.error("Failed to save layout", { id: toastId });
        }
    };

    const toggleSection = (id: string, enabled: boolean) => {
        setSections(sections.map(s => s.id === id ? { ...s, enabled } : s));
    };

    return (
        <div className="max-w-3xl space-y-6">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <SortableItem
                                key={section.id}
                                section={section}
                                toggleSection={toggleSection}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={handleSave} disabled={isSaving} className="bg-gray-900 text-white hover:bg-gray-800 rounded-lg px-6 h-10 font-medium">
                    {isSaving ? "Saving..." : "Save Layout"}
                </Button>
            </div>
        </div>
    );
}
