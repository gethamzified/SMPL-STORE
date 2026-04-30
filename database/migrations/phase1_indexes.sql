-- Phase 1: Critical Performance Indexes
-- Run this in Supabase SQL Editor

-- Products
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

-- Variants
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_status ON product_variants(status);

-- Cart
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);

-- Inventory
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON inventory_levels(variant_id);

SELECT 'Phase 1 indexes applied successfully!' as status;
