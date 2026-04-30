-- =============================================
-- DATABASE OPTIMIZATION SCRIPT
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Enable pg_trgm for fuzzy search (LIKE/ILIKE optimization)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Foreign Key Indexes (Crucial for JOIN performance)
-- Blog Posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);

-- Cart Items
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON public.cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant ON public.cart_items(variant_id);

-- Carts
CREATE INDEX IF NOT EXISTS idx_carts_customer ON public.carts(customer_id);

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_user ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Inventory Levels
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory_levels(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_variant ON public.inventory_levels(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON public.inventory_levels(location_id);

-- Order Items
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON public.order_items(variant_id);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_email ON public.orders(email);

-- Product Options/Variants
CREATE INDEX IF NOT EXISTS idx_product_options_product ON public.product_options(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);

-- Products
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
-- Fuzzy search index for product search (making "ilike" fast)
CREATE INDEX IF NOT EXISTS idx_products_title_trgm ON public.products USING gin (title gin_trgm_ops);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_product ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON public.reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- Shipping Rates
CREATE INDEX IF NOT EXISTS idx_shipping_rates_zone ON public.shipping_rates(zone_id);

-- User Cart
CREATE INDEX IF NOT EXISTS idx_user_cart_user ON public.user_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cart_product ON public.user_cart(product_id);

-- Wishlists
CREATE INDEX IF NOT EXISTS idx_wishlists_customer ON public.wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product ON public.wishlists(product_id);


-- 3. Verify
SELECT 'SUCCESS! Optimization indexes applied.' as status;
