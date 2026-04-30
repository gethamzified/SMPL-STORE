"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, Plus, Palette, Ruler } from "lucide-react";
import {
    generateVariants,
    STANDARD_SIZES,
    COMMON_COLORS,
    type GeneratedVariant
} from "@/lib/logic/variant-generator";
import { VariantTable } from "./VariantTable";
import type { ProductVariant } from "@/lib/types";

type VariantConfigSectionProps = {
    enableColor: boolean;
    enableSize: boolean;
    availableColors: string[];
    availableSizes: string[];
    variants: ProductVariant[];
    basePrice: number;
    baseSku: string;
    currencySymbol?: string;
    onEnableColorChange: (enabled: boolean) => void;
    onEnableSizeChange: (enabled: boolean) => void;
    onColorsChange: (colors: string[]) => void;
    onSizesChange: (sizes: string[]) => void;
    onVariantsChange: (variants: ProductVariant[]) => void;
};

/**
 * Variant Configuration Section for Product Form
 * 
 * Includes:
 * - Color/Size toggle checkboxes
 * - Color picker/input
 * - Size checkbox selector
 * - Auto-generates variants when config changes
 * - VariantTable for editing generated variants
 */
export function VariantConfigSection({
    enableColor,
    enableSize,
    availableColors,
    availableSizes,
    variants,
    basePrice,
    baseSku,
    currencySymbol = "Rs.",
    onEnableColorChange,
    onEnableSizeChange,
    onColorsChange,
    onSizesChange,
    onVariantsChange,
}: VariantConfigSectionProps) {
    const [newColor, setNewColor] = useState("");

    // Track if this is the first render - don't regenerate if variants already exist (editing product)
    const isInitialMount = useRef(true);

    // Check if current variants are from database (have real UUIDs, not temp- prefixed)
    const hasExistingVariants = variants.some(v => v.id && !v.id.startsWith('temp-'));

    // Regenerate variants when config changes
    // Regenerate variants when config changes
    const regenerateVariants = useCallback(() => {
        const generated = generateVariants({
            enableColor,
            enableSize,
            colors: availableColors,
            sizes: availableSizes,
            basePrice,
            baseSku,
        });

        // Merge with existing variants to preserve IDs and inventory
        const mergedVariants: ProductVariant[] = generated.map((g, idx) => {
            // Try to find a match in current variants
            const match = variants.find(v => {
                // Normalize null/undefined for comparison
                const vColor = v.color || null;
                const gColor = g.color || null;
                const vSize = v.size || null;
                const gSize = g.size || null;
                return vColor === gColor && vSize === gSize;
            });

            if (match) {
                // Keep existing variant data (ID, inventory, etc.)
                // Enforce base price sync
                return {
                    ...match,
                    price: basePrice
                };
            }

            return {
                id: `temp-${idx}-${Date.now()}`,
                product_id: '',
                ...g,
            };
        });

        onVariantsChange(mergedVariants);
    }, [enableColor, enableSize, availableColors, availableSizes, basePrice, baseSku, onVariantsChange, variants]);

    // Auto-regenerate when toggle, options, or BASE PRICE changes
    useEffect(() => {
        // We removed the 'hasExistingVariants' blocker here to allow
        // "Variantizing" an old product (Simple -> Variable).
        // The regenerateVariants function now safely MERGES instead of overwriting.

        if (isInitialMount.current) {
            isInitialMount.current = false;
            // Skip regeneration on initial mount if we have any variants
            // (We assume DB state matches config on load)
            if (variants.length > 0) {
                return;
            }
        }
        regenerateVariants();
    }, [enableColor, enableSize, availableColors.length, availableSizes.length, basePrice]);

    // Add custom color
    const addColor = useCallback(() => {
        const trimmed = newColor.trim();
        if (trimmed && !availableColors.includes(trimmed)) {
            onColorsChange([...availableColors, trimmed]);
            setNewColor("");
        }
    }, [newColor, availableColors, onColorsChange]);

    // Remove color
    const removeColor = useCallback((color: string) => {
        onColorsChange(availableColors.filter(c => c !== color));
    }, [availableColors, onColorsChange]);

    // Toggle size
    const toggleSize = useCallback((size: string) => {
        if (availableSizes.includes(size)) {
            onSizesChange(availableSizes.filter(s => s !== size));
        } else {
            // Add in order of STANDARD_SIZES
            const newSizes = [...availableSizes, size].sort(
                (a, b) => STANDARD_SIZES.indexOf(a as any) - STANDARD_SIZES.indexOf(b as any)
            );
            onSizesChange(newSizes);
        }
    }, [availableSizes, onSizesChange]);

    return (
        <div className="bg-white border border-border rounded-2xl p-8 space-y-8 shadow-sm">
            <h3 className="text-lg font-light tracking-tight text-gray-900 border-b border-gray-100 pb-4">
                Variant Configuration
            </h3>

            {/* Enable Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                            <Palette className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-900">Enable Color Variants</Label>
                            <p className="text-xs text-gray-500">Create variants for different colors</p>
                        </div>
                    </div>
                    <Switch
                        checked={enableColor}
                        onCheckedChange={onEnableColorChange}
                    />
                </div>

                <div className="flex items-center justify-between rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-100">
                            <Ruler className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-900">Enable Size Variants</Label>
                            <p className="text-xs text-gray-500">Create variants for different sizes</p>
                        </div>
                    </div>
                    <Switch
                        checked={enableSize}
                        onCheckedChange={onEnableSizeChange}
                    />
                </div>
            </div>

            {/* Color Selection (when enabled) */}
            {enableColor && (
                <div className="space-y-4">
                    <Label className="text-xs font-medium uppercase tracking-widest text-gray-500">
                        Available Colors
                    </Label>

                    {/* Common Colors Quick Add */}
                    <div className="flex flex-wrap gap-2">
                        {COMMON_COLORS.map(({ name, hex }) => {
                            const isSelected = availableColors.includes(name);
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) {
                                            removeColor(name);
                                        } else {
                                            onColorsChange([...availableColors, name]);
                                        }
                                    }}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                                        isSelected
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                                    )}
                                >
                                    <span
                                        className="w-3 h-3 rounded-full border border-gray-200"
                                        style={{ backgroundColor: hex }}
                                    />
                                    {name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add custom color (e.g., Rose Gold)"
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                            className="flex-1 h-10"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addColor}
                            disabled={!newColor.trim()}
                            className="h-10"
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Selected Colors */}
                    {availableColors.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {availableColors.map(color => (
                                <Badge
                                    key={color}
                                    variant="secondary"
                                    className="pl-3 pr-1 py-1 gap-1 text-sm"
                                >
                                    {color}
                                    <button
                                        type="button"
                                        onClick={() => removeColor(color)}
                                        className="ml-1 p-0.5 hover:bg-gray-300 rounded-full transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Size Selection (when enabled) */}
            {enableSize && (
                <div className="space-y-4">
                    <Label className="text-xs font-medium uppercase tracking-widest text-gray-500">
                        Available Sizes
                    </Label>

                    <div className="flex flex-wrap gap-2">
                        {STANDARD_SIZES.map(size => {
                            const isSelected = availableSizes.includes(size);
                            return (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => toggleSize(size)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg border text-sm font-medium transition-all min-w-[3rem]",
                                        isSelected
                                            ? "border-gray-900 bg-gray-900 text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                    )}
                                >
                                    {size}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Variant Table */}
            <div className="pt-4 border-t border-gray-100">
                <Label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-4 block">
                    Generated Variants ({variants.length})
                </Label>
                <VariantTable
                    variants={variants}
                    onVariantsChange={onVariantsChange}
                    enableColor={enableColor}
                    enableSize={enableSize}
                    currencySymbol={currencySymbol}
                    baseSku={baseSku}
                />
            </div>
        </div>
    );
}
