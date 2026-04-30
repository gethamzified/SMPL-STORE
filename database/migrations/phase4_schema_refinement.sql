-- Phase 4: Schema Refinement
-- Run this in Supabase SQL Editor

-- ============================================================
-- STEP 1: Check for duplicates before adding constraints
-- ============================================================

-- Check for duplicate inventory entries (must return 0)
SELECT location_id, variant_id, COUNT(*) as cnt
FROM inventory_levels
GROUP BY location_id, variant_id
HAVING COUNT(*) > 1;

-- Check for duplicate wishlist entries (must return 0)
SELECT customer_id, product_id, variant_id, COUNT(*) as cnt
FROM wishlists
GROUP BY customer_id, product_id, variant_id
HAVING COUNT(*) > 1;

-- Check for multiple default addresses per customer (must return 0)
SELECT customer_id, COUNT(*) as cnt
FROM customer_addresses
WHERE is_default = true
GROUP BY customer_id
HAVING COUNT(*) > 1;

-- ============================================================
-- STEP 2: Remove product_variants.stock (use inventory_levels only)
-- ============================================================

ALTER TABLE product_variants DROP COLUMN IF EXISTS stock;

-- ============================================================
-- STEP 3: Make cart_items.variant_id NOT NULL
-- ============================================================

-- First, delete any cart items without variant_id (orphaned data)
DELETE FROM cart_items WHERE variant_id IS NULL;

-- Now enforce the constraint
ALTER TABLE cart_items ALTER COLUMN variant_id SET NOT NULL;

-- ============================================================
-- STEP 4: Add Uniqueness Constraints
-- ============================================================

-- Prevent duplicate inventory entries per location + variant
ALTER TABLE inventory_levels 
ADD CONSTRAINT unique_location_variant UNIQUE (location_id, variant_id);

-- One default address per customer (partial unique index)
CREATE UNIQUE INDEX IF NOT EXISTS one_default_address
ON customer_addresses(customer_id)
WHERE is_default = true;

-- Prevent duplicate wishlist entries
ALTER TABLE wishlists 
ADD CONSTRAINT unique_wishlist_entry UNIQUE (customer_id, product_id, variant_id);

-- ============================================================
-- VERIFICATION
-- ============================================================

SELECT 'Phase 4 migration completed successfully!' as status;
