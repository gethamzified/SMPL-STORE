-- Phase 3: Complete Inventory Logic Migration
-- This script handles all edge cases automatically
-- Run this in Supabase SQL Editor

-- ============================================================
-- STEP 1: Create default variants for products without any
-- ============================================================

INSERT INTO product_variants (product_id, title, price, sale_price, stock, status)
SELECT 
    p.id,
    'Default',
    p.price,
    p.sale_price,
    p.stock,
    'active'
FROM products p
WHERE p.id NOT IN (SELECT DISTINCT product_id FROM product_variants WHERE product_id IS NOT NULL);

-- ============================================================
-- STEP 2: Migrate inventory_levels from product_id to variant_id
-- ============================================================

-- First, update any inventory_levels that have product_id but no variant_id
UPDATE inventory_levels il
SET variant_id = (
    SELECT pv.id 
    FROM product_variants pv 
    WHERE pv.product_id = il.product_id 
    ORDER BY pv.position ASC, pv.created_at ASC
    LIMIT 1
)
WHERE il.variant_id IS NULL 
  AND il.product_id IS NOT NULL;

-- ============================================================
-- STEP 3: Remove orphaned inventory_levels (no valid variant)
-- ============================================================

DELETE FROM inventory_levels 
WHERE variant_id IS NULL;

-- ============================================================
-- STEP 4: Make variant_id NOT NULL (enforce constraint)
-- ============================================================

ALTER TABLE inventory_levels ALTER COLUMN variant_id SET NOT NULL;

-- ============================================================
-- STEP 5: Drop the product_id column (no longer needed)
-- ============================================================

ALTER TABLE inventory_levels DROP COLUMN IF EXISTS product_id;

-- ============================================================
-- VERIFICATION: Check the results
-- ============================================================

SELECT 
    'Products without variants' as check_type,
    COUNT(*) as count
FROM products 
WHERE id NOT IN (SELECT DISTINCT product_id FROM product_variants)

UNION ALL

SELECT 
    'Inventory levels without variant_id' as check_type,
    COUNT(*) as count
FROM inventory_levels 
WHERE variant_id IS NULL;

-- If both counts are 0, migration is successful!
SELECT 'Phase 3 migration completed successfully!' as status;
