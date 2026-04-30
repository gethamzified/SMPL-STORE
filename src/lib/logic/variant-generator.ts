/**
 * Clothing Variant Generator
 * 
 * Generates product variants based on color/size configuration.
 * Supports 4 cases:
 * 1. Color + Size → Cartesian product (e.g., Black-M, Black-L, White-M, White-L)
 * 2. Only Color → One variant per color
 * 3. Only Size → One variant per size  
 * 4. Neither → One default variant
 */

import { ProductVariant } from '@/lib/types';

// Standard clothing sizes
export const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;
export type StandardSize = typeof STANDARD_SIZES[number];

// Common clothing colors with hex values for UI
export const COMMON_COLORS = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Navy', hex: '#1E3A5F' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Charcoal', hex: '#374151' },
    { name: 'Beige', hex: '#D4B896' },
    { name: 'Olive', hex: '#556B2F' },
    { name: 'Brown', hex: '#8B4513' },
    { name: 'Burgundy', hex: '#800020' },
    { name: 'Cream', hex: '#FFFDD0' },
] as const;

export type VariantGeneratorConfig = {
    enableColor: boolean;
    enableSize: boolean;
    colors: string[];
    sizes: string[];
    basePrice: number;
    baseSku?: string;
};

export type GeneratedVariant = Omit<ProductVariant, 'id' | 'product_id' | 'created_at' | 'updated_at'>;

/**
 * Generate variant title from color/size
 */
function generateVariantTitle(color?: string | null, size?: string | null): string {
    if (color && size) return `${color} / ${size}`;
    if (color) return color;
    if (size) return size;
    return 'Default';
}

/**
 * Generate SKU from base SKU and variant options
 */
function generateVariantSku(baseSku: string, color?: string | null, size?: string | null): string {
    const parts = [baseSku];
    if (color) parts.push(color.toUpperCase().replace(/\s+/g, '').slice(0, 3));
    if (size) parts.push(size.toUpperCase());
    return parts.join('-');
}

/**
 * Generate all variants based on configuration
 */
export function generateVariants(config: VariantGeneratorConfig): GeneratedVariant[] {
    const { enableColor, enableSize, colors, sizes, basePrice, baseSku = 'PROD' } = config;
    const variants: GeneratedVariant[] = [];

    // Case 1: Color + Size enabled → Cartesian product
    if (enableColor && enableSize && colors.length > 0 && sizes.length > 0) {
        let position = 0;
        for (const color of colors) {
            for (const size of sizes) {
                variants.push({
                    title: generateVariantTitle(color, size),
                    color,
                    size,
                    price: basePrice,
                    inventory_quantity: 0,
                    sku: generateVariantSku(baseSku, color, size),
                    status: 'active',
                    position: position++,
                });
            }
        }
        return variants;
    }

    // Case 2: Only Color enabled
    if (enableColor && colors.length > 0) {
        colors.forEach((color, index) => {
            variants.push({
                title: generateVariantTitle(color, null),
                color,
                size: null,
                price: basePrice,
                inventory_quantity: 0,
                sku: generateVariantSku(baseSku, color, null),
                status: 'active',
                position: index,
            });
        });
        return variants;
    }

    // Case 3: Only Size enabled
    if (enableSize && sizes.length > 0) {
        sizes.forEach((size, index) => {
            variants.push({
                title: generateVariantTitle(null, size),
                color: null,
                size,
                price: basePrice,
                inventory_quantity: 0,
                sku: generateVariantSku(baseSku, null, size),
                status: 'active',
                position: index,
            });
        });
        return variants;
    }

    // Case 4: Neither enabled → Default variant
    variants.push({
        title: 'Default',
        color: null,
        size: null,
        price: basePrice,
        inventory_quantity: 0,
        sku: baseSku,
        status: 'active',
        position: 0,
    });

    return variants;
}

/**
 * Check if variant configuration has changed
 */
export function hasVariantConfigChanged(
    oldConfig: VariantGeneratorConfig,
    newConfig: VariantGeneratorConfig
): boolean {
    if (oldConfig.enableColor !== newConfig.enableColor) return true;
    if (oldConfig.enableSize !== newConfig.enableSize) return true;

    const oldColors = [...oldConfig.colors].sort().join(',');
    const newColors = [...newConfig.colors].sort().join(',');
    if (oldColors !== newColors) return true;

    const oldSizes = [...oldConfig.sizes].sort().join(',');
    const newSizes = [...newConfig.sizes].sort().join(',');
    if (oldSizes !== newSizes) return true;

    return false;
}

/**
 * Generate SKUs for all variants in bulk
 */
export function generateBulkSkus(
    variants: GeneratedVariant[],
    baseSku: string
): GeneratedVariant[] {
    return variants.map(v => ({
        ...v,
        sku: generateVariantSku(baseSku, v.color, v.size),
    }));
}

/**
 * Update all variant prices
 */
export function updateBulkPrices(
    variants: GeneratedVariant[],
    newPrice: number
): GeneratedVariant[] {
    return variants.map(v => ({
        ...v,
        price: newPrice,
    }));
}
