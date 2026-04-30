'use server'

import { createAdminClient } from '@/lib/supabase/admin';

export type StockCheckResult = {
    available: number;
    isAvailable: boolean;
    error?: string;
};

import { InventoryService } from '@/services/inventory';

// ... (existing helper types)

export async function checkVariantStock(variantId: string, quantity: number): Promise<StockCheckResult> {
    try {
        const supabase = await createAdminClient();

        // 1. Get Product & Variant Info (Admin client used for product settings which might be protected?)
        const { data: variant } = await supabase
            .from('product_variants')
            .select('product_id')
            .eq('id', variantId)
            .single();

        if (variant) {
            const { data: product } = await supabase
                .from('products')
                .select('track_inventory, allow_backorder')
                .eq('id', variant.product_id)
                .single();

            // If product doesn't track inventory, always available
            if (product && product.track_inventory === false) {
                return { available: 999, isAvailable: true };
            }

            // If backorders allowed, always available (but we track it)
            if (product && product.allow_backorder === true) {
                // Fetch actual stock for display
                const totalStock = await InventoryService.getVariantStock(variantId);
                return { available: totalStock, isAvailable: true };
            }
        }

        // 2. Check Inventory Levels via Centralized Service
        const totalAvailable = await InventoryService.getVariantStock(variantId);

        return {
            available: totalAvailable,
            isAvailable: totalAvailable >= quantity
        };
    } catch (error) {
        console.error('Stock Check Error:', error);
        return { available: 0, isAvailable: false, error: 'Failed to check stock' };
    }
}

export type CartValidationResult = {
    isValid: boolean;
    errors: {
        itemId: string;
        message: string;
        available: number;
    }[];
};

export async function validateCart(items: { id: string; variantId?: string; quantity: number }[]): Promise<CartValidationResult> {
    const errors: CartValidationResult['errors'] = [];

    for (const item of items) {
        if (!item.variantId) continue; // Skip if no variant (or handle product-level stock if needed)

        const result = await checkVariantStock(item.variantId, item.quantity);
        if (!result.isAvailable) {
            errors.push({
                itemId: item.id,
                message: result.error || 'Insufficient stock',
                available: result.available
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}
