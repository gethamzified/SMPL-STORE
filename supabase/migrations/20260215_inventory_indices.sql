-- Shopify-Grade Optimization: Indices for fast inventory lookups
-- 1. Simple index for aggregating total stock per variant
CREATE INDEX IF NOT EXISTS idx_inventory_levels_variant_id ON inventory_levels(variant_id);

-- 2. Composite index for greedy deduction strategy (variant + location)
-- This helps when we look up specific rows to lock/deduct
CREATE INDEX IF NOT EXISTS idx_inventory_levels_variant_location ON inventory_levels(variant_id, location_id);
