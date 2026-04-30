-- MANDATORY PRODUCTION FIXES
-- Run this in Supabase SQL Editor BEFORE going live.
-- Includes fixes for: Cart Duplication, Inventory Duplication, Address/Wishlist Constraints, Security Columns, Safety Checks

-- ============================================================
-- FIX 1: Prevent duplicate cart items (CRITICAL)
-- ============================================================

-- Deduplicate (Idempotent: safe to run multiple times)
DELETE FROM cart_items
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY cart_id, variant_id 
      ORDER BY created_at DESC
    ) as rn
    FROM cart_items
  ) sub
  WHERE rn > 1
);

-- Add unique constraint (Idempotent)
ALTER TABLE cart_items DROP CONSTRAINT IF EXISTS cart_unique_variant;
ALTER TABLE cart_items ADD CONSTRAINT cart_unique_variant UNIQUE (cart_id, variant_id);

-- ============================================================
-- FIX 2: Prevent duplicate inventory entries (CRITICAL)
-- ============================================================

-- Deduplicate (Idempotent)
DELETE FROM inventory_levels
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY location_id, variant_id 
      ORDER BY available DESC
    ) as rn
    FROM inventory_levels
  ) sub
  WHERE rn > 1
);

-- Add unique constraint (Idempotent)
ALTER TABLE inventory_levels DROP CONSTRAINT IF EXISTS inventory_unique_variant_location;
ALTER TABLE inventory_levels ADD CONSTRAINT inventory_unique_variant_location UNIQUE (location_id, variant_id);

-- ============================================================
-- FIX 3: Inventory Safety Check
-- ============================================================

-- Ensure inventory never goes negative (Idempotent)
ALTER TABLE inventory_levels DROP CONSTRAINT IF EXISTS inventory_non_negative;
ALTER TABLE inventory_levels ADD CONSTRAINT inventory_non_negative CHECK (available >= 0);

-- ============================================================
-- FIX 4: Strong Review Verification
-- ============================================================

-- Link reviews to specific order items (Idempotent check)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'verified_order_item_id') THEN
    ALTER TABLE reviews ADD COLUMN verified_order_item_id uuid REFERENCES order_items(id);
  END IF;
END $$;

-- ============================================================
-- FIX 5: One default address per customer
-- ============================================================

DROP INDEX IF EXISTS one_default_address_per_customer;
CREATE UNIQUE INDEX one_default_address_per_customer
ON customer_addresses(customer_id)
WHERE is_default = true;

-- ============================================================
-- FIX 6: Wishlist uniqueness
-- ============================================================

ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlist_unique_item;
ALTER TABLE wishlists ADD CONSTRAINT wishlist_unique_item UNIQUE (customer_id, product_id, variant_id);

-- ============================================================
-- FIX 7: Order Totals Safety (Recommended)
-- ============================================================

-- Prevent negative totals in orders (Idempotent)
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_total_non_negative;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_subtotal_non_negative;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_shipping_non_negative;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_tax_non_negative;

ALTER TABLE orders ADD CONSTRAINT orders_total_non_negative CHECK (total >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_subtotal_non_negative CHECK (subtotal >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_shipping_non_negative CHECK (shipping_total >= 0);
ALTER TABLE orders ADD CONSTRAINT orders_tax_non_negative CHECK (tax_total >= 0);

-- ============================================================
-- NOTE: products.price is kept as DISPLAY FALLBACK ONLY
-- Checkout logic must ALWAYS use product_variants.price
-- ============================================================

COMMENT ON COLUMN products.price IS 'DISPLAY ONLY - Do NOT use in checkout. Use product_variants.price for all pricing logic.';
COMMENT ON COLUMN products.sale_price IS 'DISPLAY ONLY - Do NOT use in checkout. Use product_variants.sale_price for all pricing logic.';

-- ============================================================
-- DONE
-- ============================================================

SELECT 'All production fixes applied successfully (idempotent run)!' as status;
