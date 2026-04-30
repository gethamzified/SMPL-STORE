import { createClient } from '@supabase/supabase-js';

// Centralized Inventory Service
// Single Source of Truth for stock levels across the application.
// Enforces "Shopify-Grade" consistency by preventing manual summing elsewhere.

const getLiveClient = () => {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' })
            }
        }
    );
};

export const InventoryService = {
    /**
     * Get total available stock for a single variant across all locations.
     * Guaranteed to be fresh (no-store cache).
     */
    async getVariantStock(variantId: string): Promise<number> {
        if (!variantId) return 0;

        const supabase = getLiveClient();
        const { data, error } = await supabase
            .from('inventory_levels')
            .select('available')
            .eq('variant_id', variantId);

        if (error || !data) {
            console.error(`InventoryService Error (getVariantStock):`, error);
            return 0;
        }

        // Sum across all locations
        return data.reduce((total, record) => total + (record.available || 0), 0);
    },

    /**
     * Batch fetch stock for multiple variants.
     * Efficiently aggregating queries to avoid N+1 problems.
     */
    async getVariantsStock(variantIds: string[]): Promise<Record<string, number>> {
        if (!variantIds.length) return {};

        const supabase = getLiveClient();
        const { data, error } = await supabase
            .from('inventory_levels')
            .select('variant_id, available')
            .in('variant_id', variantIds);

        if (error || !data) {
            console.error(`InventoryService Error (getVariantsStock):`, error);
            return {};
        }

        const stockMap: Record<string, number> = {};

        // aggregate by variant_id
        for (const record of data) {
            const vId = record.variant_id;
            const qty = record.available || 0;
            stockMap[vId] = (stockMap[vId] || 0) + qty;
        }

        return stockMap;
    },

    /**
     * Boolean check for stock availability.
     * Strict check: Is TOTAL available >= quantity requested?
     */
    async validateStock(variantId: string, quantity: number): Promise<boolean> {
        const currentStock = await this.getVariantStock(variantId);
        return currentStock >= quantity;
    }
};
