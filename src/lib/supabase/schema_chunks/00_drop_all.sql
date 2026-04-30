-- ==========================================
-- 00. DROP ALL TABLES & RESET
-- Run this FIRST to clean everything
-- ==========================================

-- WARNING: This will delete ALL data!
-- Make sure you have a backup if needed!

-- Drop RLS policies first (avoid dependency errors)
DROP POLICY IF EXISTS "Public: View visible collections" ON collections;
DROP POLICY IF EXISTS "Public: View active products" ON products;
DROP POLICY IF EXISTS "Public: View product variants" ON product_variants;
DROP POLICY IF EXISTS "Public: View product options" ON product_options;
DROP POLICY IF EXISTS "Public: View approved reviews" ON reviews;
DROP POLICY IF EXISTS "Public: View active discounts" ON discounts;
DROP POLICY IF EXISTS "Public: View published blog" ON blog_posts;
DROP POLICY IF EXISTS "Public: View site config" ON site_config;
DROP POLICY IF EXISTS "Public: View published pages" ON pages;
DROP POLICY IF EXISTS "Public: View navigation" ON navigation_menus;
DROP POLICY IF EXISTS "Customer: View own profile" ON customers;
DROP POLICY IF EXISTS "Customer: Update own profile" ON customers;
DROP POLICY IF EXISTS "Customer: View own addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Customer: Manage own addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Customer: View own orders" ON orders;
DROP POLICY IF EXISTS "Customer: Create orders" ON orders;
DROP POLICY IF EXISTS "Customer: View order items" ON order_items;
DROP POLICY IF EXISTS "Customer: Manage own wishlist" ON wishlists;
DROP POLICY IF EXISTS "Customer: Manage own cart" ON carts;
DROP POLICY IF EXISTS "Customer: Manage cart items" ON cart_items;
DROP POLICY IF EXISTS "Customer: Submit reviews" ON reviews;
DROP POLICY IF EXISTS "Customer: View own reviews" ON reviews;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS inventory_levels CASCADE;
DROP TABLE IF EXISTS inventory_locations CASCADE;
DROP TABLE IF EXISTS shipping_rates CASCADE;
DROP TABLE IF EXISTS shipping_zones CASCADE;
DROP TABLE IF EXISTS navigation_menus CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS site_config CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS discounts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS product_options CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS collections CASCADE;

-- Drop custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS update_customer_order_metrics() CASCADE;

-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

SELECT 'All SMPL tables and functions have been dropped successfully!' as status;
