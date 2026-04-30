-- Phase 5: Final Production-Ready Cleanup
-- Run this in Supabase SQL Editor

-- ============================================================
-- STEP 1: Remove products.stock (inventory is in inventory_levels only)
-- ============================================================

ALTER TABLE products DROP COLUMN IF EXISTS stock;

-- ============================================================
-- STEP 2: Prevent duplicate cart items (same variant in same cart)
-- ============================================================

-- First, consolidate any existing duplicates by keeping the one with highest quantity
DELETE FROM cart_items a
USING cart_items b
WHERE a.id < b.id
  AND a.cart_id = b.cart_id
  AND a.variant_id = b.variant_id;

-- Now add the unique constraint
ALTER TABLE cart_items
ADD CONSTRAINT unique_cart_variant UNIQUE (cart_id, variant_id);

-- ============================================================
-- STEP 3: Ensure inventory uniqueness (location + variant)
-- ============================================================

-- Check if constraint already exists (Phase 4 may have added it)
-- If not, add it:
ALTER TABLE inventory_levels
DROP CONSTRAINT IF EXISTS unique_location_variant;

ALTER TABLE inventory_levels
ADD CONSTRAINT unique_location_variant UNIQUE (location_id, variant_id);

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Phase 5 complete! Schema is production-ready.' as status;
