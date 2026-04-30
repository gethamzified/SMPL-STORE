-- ==========================================
-- 08. ROW LEVEL SECURITY & POLICIES
-- Run this ninth
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for storefront)
CREATE POLICY "Public: View visible collections" ON collections FOR SELECT USING (is_visible = true);
CREATE POLICY "Public: View active products" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public: View product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public: View product options" ON product_options FOR SELECT USING (true);
CREATE POLICY "Public: View approved reviews" ON reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Public: View active discounts" ON discounts FOR SELECT USING (is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW()));
CREATE POLICY "Public: View published blog" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public: View published pages" ON pages FOR SELECT USING (is_published = true);
CREATE POLICY "Public: View site config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public: View navigation" ON navigation_menus FOR SELECT USING (true);

-- CUSTOMER POLICIES (for authenticated users)
CREATE POLICY "Customer: View own profile" ON customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Customer: Update own profile" ON customers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Customer: View own addresses" ON customer_addresses FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customer: Manage own addresses" ON customer_addresses FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customer: View own orders" ON orders FOR SELECT USING (customer_id = auth.uid());
CREATE POLICY "Customer: Create orders" ON orders FOR INSERT WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);
CREATE POLICY "Customer: View order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()));
CREATE POLICY "Customer: Manage own wishlist" ON wishlists FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customer: Manage own cart" ON carts FOR ALL USING (customer_id = auth.uid());
CREATE POLICY "Customer: Manage cart items" ON cart_items FOR ALL USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.customer_id = auth.uid()));
CREATE POLICY "Customer: Submit reviews" ON reviews FOR INSERT WITH CHECK (customer_id = auth.uid());
CREATE POLICY "Customer: View own reviews" ON reviews FOR SELECT USING (customer_id = auth.uid());

-- Force schema reload
NOTIFY pgrst, 'reload schema';

SELECT 'Row Level Security & Policies applied!' as status;
