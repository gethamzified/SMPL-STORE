-- Migration: 20260216_drop_redundant_constraints_indexes
-- Description: Drops redundant unique constraints and indexes identified in database audit.

-- Drop redundant constraints on wishlists (Keep 'unique_wishlist_entry')
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS unique_wishlist_item;
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlist_unique_item;
ALTER TABLE wishlists DROP CONSTRAINT IF EXISTS wishlists_customer_id_product_id_variant_id_key;

-- Drop redundant indexes on products
DROP INDEX IF EXISTS idx_products_category_id;
DROP INDEX IF EXISTS idx_products_created_at;

-- Drop redundant indexes on product_variants
DROP INDEX IF EXISTS idx_variants_product;
