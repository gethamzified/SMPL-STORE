-- Performance: 20260501000002_performance_indices.sql
-- Description: Adds indices to frequently queried columns to improve storefront and admin performance.

-- 1. ORDERS
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- 2. ORDER ITEMS
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- 3. INVENTORY
CREATE INDEX IF NOT EXISTS idx_inventory_levels_variant_id ON public.inventory_levels(variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_levels_product_id ON public.inventory_levels(product_id);

-- 4. PRODUCTS & VARIANTS
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

-- 5. CUSTOMERS
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
