"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
    RefreshCw,
    Hash,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import type { ProductVariant } from "@/lib/types";

type VariantTableProps = {
    variants: ProductVariant[];
    onVariantsChange: (variants: ProductVariant[]) => void;
    enableColor: boolean;
    enableSize: boolean;
    currencySymbol?: string;
    baseSku?: string;
};

/**
 * Admin Variant Table with inline editing
 * - Groups by color when both color and size are enabled
 * - Inline price/stock editing
 * - Bulk price update
 * - Auto SKU generation
 * - Enable/disable toggle
 */
export function VariantTable({
    variants,
    onVariantsChange,
    enableColor,
    enableSize,
    currencySymbol = "Rs.",
    baseSku = "PROD",
}: VariantTableProps) {
    const [expandedColors, setExpandedColors] = useState<Set<string>>(new Set());

    // Update a single variant field
    const updateVariant = useCallback((index: number, field: keyof ProductVariant, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        onVariantsChange(updated);
    }, [variants, onVariantsChange]);



    // Auto-generate SKUs
    const autoGenerateSkus = useCallback(() => {
        const updated = variants.map(v => {
            const parts = [baseSku];
            if (v.color) parts.push(v.color.toUpperCase().replace(/\s+/g, '').slice(0, 3));
            if (v.size) parts.push(v.size.toUpperCase());
            return { ...v, sku: parts.join('-') };
        });
        onVariantsChange(updated);
    }, [variants, baseSku, onVariantsChange]);

    // Toggle color group expansion
    const toggleColorGroup = (color: string) => {
        setExpandedColors(prev => {
            const next = new Set(prev);
            if (next.has(color)) {
                next.delete(color);
            } else {
                next.add(color);
            }
            return next;
        });
    };

    // Group variants by color for display
    const groupedVariants = enableColor && enableSize
        ? variants.reduce((acc, v, idx) => {
            const color = v.color || 'Default';
            if (!acc[color]) acc[color] = [];
            acc[color].push({ variant: v, index: idx });
            return acc;
        }, {} as Record<string, { variant: ProductVariant; index: number }[]>)
        : null;

    if (variants.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 text-sm">
                Configure colors and/or sizes above to generate variants
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Bulk Actions */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={autoGenerateSkus}
                    className="h-9"
                >
                    <Hash className="w-3.5 h-3.5 mr-1" />
                    Auto-Generate SKUs
                </Button>
            </div>

            {/* Variant Table */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="col-span-12 md:col-span-4 lg:col-span-5">Variant</div>
                    <div className="col-span-4 lg:col-span-2">Stock</div>
                    <div className="col-span-8 lg:col-span-5">SKU</div>
                    <div className="col-span-2 text-center">Active</div>
                </div>

                {/* Grouped Rows (Color × Size) */}
                {groupedVariants ? (
                    Object.entries(groupedVariants).map(([color, items]) => (
                        <div key={color} className="border-t border-gray-100">
                            {/* Color Group Header */}
                            <button
                                type="button"
                                onClick={() => toggleColorGroup(color)}
                                className="w-full grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="col-span-12 flex items-center gap-2">
                                    {expandedColors.has(color) ? (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="font-medium text-gray-900">{color}</span>
                                    <span className="text-xs text-gray-400">({items.length} sizes)</span>
                                </div>
                            </button>

                            {/* Size Rows */}
                            {expandedColors.has(color) && items.map(({ variant, index }) => (
                                <VariantRow
                                    key={variant.id || index}
                                    variant={variant}
                                    index={index}
                                    showColor={false}
                                    onUpdate={updateVariant}
                                />
                            ))}
                        </div>
                    ))
                ) : (
                    // Flat list (Color only, Size only, or Default)
                    variants.map((variant, index) => (
                        <VariantRow
                            key={variant.id || index}
                            variant={variant}
                            index={index}
                            showColor={enableColor}
                            onUpdate={updateVariant}
                        />
                    ))
                )}
            </div>

            <p className="text-xs text-gray-400 text-center">
                {variants.length} variant{variants.length !== 1 ? 's' : ''} total
            </p>
        </div>
    );
}

// Individual Variant Row
function VariantRow({
    variant,
    index,
    showColor,
    onUpdate,
}: {
    variant: ProductVariant;
    index: number;
    showColor: boolean;
    onUpdate: (index: number, field: keyof ProductVariant, value: any) => void;
}) {
    const label = showColor
        ? variant.color || variant.title || 'Default'
        : variant.size || variant.title || 'Default';

    return (
        <div className={cn(
            "grid grid-cols-12 gap-2 px-4 py-2.5 border-t border-gray-100 items-center",
            variant.status === 'disabled' && "opacity-50 bg-gray-50"
        )}>
            <div className="col-span-12 md:col-span-4 lg:col-span-5">
                <span className="text-sm font-medium text-gray-700 pl-6">
                    {variant.size || label}
                </span>
            </div>

            {/* Stock (Display only - managed in inventory_levels) */}
            <div className="col-span-4 lg:col-span-2">
                <Input
                    type="number"
                    value={variant.inventory_quantity ?? 0}
                    onChange={(e) => onUpdate(index, 'inventory_quantity', parseInt(e.target.value) || 0)}
                    className="h-8 text-sm font-mono"
                    title="Stock is managed in inventory_levels"
                />
            </div>

            {/* SKU */}
            <div className="col-span-8 lg:col-span-5">
                <Input
                    type="text"
                    value={variant.sku || ''}
                    onChange={(e) => onUpdate(index, 'sku', e.target.value)}
                    className="h-8 text-sm font-mono"
                    placeholder="Auto or manual"
                />
            </div>

            {/* Status Toggle */}
            <div className="col-span-2 flex justify-center">
                <Switch
                    checked={variant.status !== 'disabled'}
                    onCheckedChange={(checked) => onUpdate(index, 'status', checked ? 'active' : 'disabled')}
                />
            </div>
        </div>
    );
}
