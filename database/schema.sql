-- ==========================================
-- SMPL WEBSTORE SCHEMA (SHOPIFY-INSPIRED)
-- Comprehensive e-commerce schema with full feature support
-- ==========================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ==========================================
-- 1. COLLECTIONS (Product Categories)
-- ==========================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_visible ON collections(is_visible) WHERE is_visible = true;

-- ==========================================
-- 2. PRODUCTS (Core product catalog)
-- ==========================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing (consistent naming for frontend/backend)
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  cost_per_item NUMERIC(10,2),
  
  -- Media (JSONB arrays for flexibility)
  cover_image TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  
  -- Inventory
  sku TEXT UNIQUE,
  barcode TEXT,
  stock INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  weight NUMERIC(10,2),
  weight_unit TEXT DEFAULT 'kg',
  
  -- Organization
  category_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  vendor TEXT,
  product_type TEXT,
  
  -- Status & Visibility
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Flexible metadata for custom attributes
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- ==========================================
-- 3. PRODUCT VARIANTS (Size, Color, Material)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  
  -- Up to 3 variant options (Shopify-style)
  option1_name TEXT DEFAULT 'Size',
  option1_value TEXT,
  option2_name TEXT DEFAULT 'Color',
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  
  -- Variant-specific pricing (overrides product price if set)
  price NUMERIC(10,2),
  sale_price NUMERIC(10,2),
  
  -- Inventory
  sku TEXT UNIQUE,
  barcode TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  
  -- Media
  image_url TEXT,
  
  -- Position for ordering
  position INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);

-- ==========================================
-- 4. PRODUCT OPTIONS (Dynamic variant options definition)
-- ==========================================
CREATE TABLE IF NOT EXISTS product_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, -- e.g., "Size", "Color"
  position INTEGER DEFAULT 0,
  values TEXT[] DEFAULT '{}', -- e.g., ["S", "M", "L", "XL"]
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_options_product ON product_options(product_id);

-- ==========================================
-- 5. CUSTOMERS (Extended user profiles)
-- ==========================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Customer metrics
  total_spent NUMERIC(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Marketing
  accepts_marketing BOOLEAN DEFAULT false,
  marketing_updated_at TIMESTAMPTZ,
  
  -- Customer notes (for admin)
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata for custom fields
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ==========================================
-- 6. CUSTOMER ADDRESSES
-- ==========================================
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  address1 TEXT NOT NULL,
  address2 TEXT,
  city TEXT NOT NULL,
  province TEXT,
  province_code TEXT,
  country TEXT NOT NULL DEFAULT 'US',
  country_code TEXT DEFAULT 'US',
  zip TEXT NOT NULL,
  phone TEXT,
  
  is_default BOOLEAN DEFAULT false,
  address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_customer ON customer_addresses(customer_id);

-- ==========================================
-- 7. ORDERS
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL UNIQUE,
  
  -- Customer (nullable for guest checkout)
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'voided', 'failed')),
  fulfillment_status TEXT DEFAULT 'unfulfilled' CHECK (fulfillment_status IN ('unfulfilled', 'partial', 'fulfilled')),
  
  -- Pricing breakdown
  currency TEXT DEFAULT 'PKR',
  subtotal NUMERIC(10,2) NOT NULL,
  discount_total NUMERIC(10,2) DEFAULT 0,
  shipping_total NUMERIC(10,2) DEFAULT 0,
  tax_total NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  
  -- Addresses (stored as JSONB for historical record)
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Fulfillment
  tracking_number TEXT,
  tracking_url TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Payment
  payment_method TEXT,
  payment_reference TEXT,
  
  -- Discounts applied
  discount_codes JSONB DEFAULT '[]',
  
  -- Notes
  customer_note TEXT,
  internal_note TEXT,
  admin_message TEXT,
  
  -- Source
  source TEXT DEFAULT 'web',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  cancelled_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ==========================================
-- 8. ORDER LINE ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  -- Product reference (nullable - product may be deleted)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product at time of order (denormalized for historical accuracy)
  title TEXT NOT NULL,
  variant_title TEXT,
  sku TEXT,
  image_url TEXT,
  
  -- Pricing
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL,
  
  -- Fulfillment
  fulfilled_quantity INTEGER DEFAULT 0,
  requires_shipping BOOLEAN DEFAULT true,
  
  -- Properties (e.g., customization options)
  properties JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ==========================================
-- 9. REVIEWS
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Review content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT,
  
  -- Reviewer info (for display)
  reviewer_name TEXT,
  reviewer_email TEXT,
  
  -- Moderation
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
  is_verified_purchase BOOLEAN DEFAULT false,
  
  -- Engagement
  helpful_count INTEGER DEFAULT 0,
  
  -- Admin response
  admin_response TEXT,
  admin_response_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

-- ==========================================
-- 10. DISCOUNTS & COUPONS
-- ==========================================
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT,
  
  -- Discount type
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')),
  value NUMERIC(10,2) NOT NULL,
  
  -- Conditions
  minimum_purchase NUMERIC(10,2) DEFAULT 0,
  minimum_quantity INTEGER DEFAULT 0,
  
  -- Applicability
  applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'collections', 'products')),
  applicable_ids UUID[] DEFAULT '{}',
  
  -- Exclusions
  exclude_sale_items BOOLEAN DEFAULT false,
  
  -- Usage limits
  usage_limit INTEGER,
  usage_limit_per_customer INTEGER,
  usage_count INTEGER DEFAULT 0,
  
  -- Validity
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Combinability
  can_combine BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_discounts_code ON discounts(code);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active, starts_at, ends_at);

-- ==========================================
-- 11. WISHLIST / FAVORITES
-- ==========================================
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Ensure unique product per customer
  UNIQUE(customer_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_customer ON wishlists(customer_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product ON wishlists(product_id);

-- ==========================================
-- 12. CART (Server-side cart for logged-in users)
-- ==========================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  session_id TEXT, -- For guest carts
  
  -- Cart state
  currency TEXT DEFAULT 'PKR',
  discount_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(cart_id, product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_carts_customer ON carts(customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ==========================================
-- 13. BLOG POSTS
-- ==========================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  
  -- Author
  author_id UUID REFERENCES auth.users,
  author_name TEXT,
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_published ON blog_posts(published_at DESC);

-- ==========================================
-- 14. SITE CONFIGURATION
-- ==========================================
CREATE TABLE IF NOT EXISTS site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_config_key ON site_config(key);

-- ==========================================
-- 15. PAGES (CMS Pages)
-- ==========================================
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  sections JSONB DEFAULT '[]', -- Page builder sections
  template TEXT DEFAULT 'default',
  
  -- Status
  is_published BOOLEAN DEFAULT false,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_published ON pages(is_published);

-- ==========================================
-- 16. NAVIGATION MENUS
-- ==========================================
CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  handle TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  items JSONB DEFAULT '[]', -- Recursive menu structure
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_menus_handle ON navigation_menus(handle);

-- ==========================================
-- 17. SHIPPING ZONES & RATES
-- ==========================================
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  countries TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping_rates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  zone_id UUID REFERENCES shipping_zones(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Rate calculation
  rate_type TEXT DEFAULT 'flat' CHECK (rate_type IN ('flat', 'weight_based', 'price_based', 'free')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  -- Conditions
  min_order_amount NUMERIC(10,2),
  max_order_amount NUMERIC(10,2),
  min_weight NUMERIC(10,2),
  max_weight NUMERIC(10,2),
  
  -- Delivery estimate
  min_delivery_days INTEGER,
  max_delivery_days INTEGER,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- 18. INVENTORY LOCATIONS (Multi-location support)
-- ==========================================
CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address JSONB,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory_levels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  location_id UUID REFERENCES inventory_locations(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  available INTEGER DEFAULT 0,
  reserved INTEGER DEFAULT 0,
  incoming INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Either variant or product (not both)
  CHECK ((variant_id IS NOT NULL AND product_id IS NULL) OR (variant_id IS NULL AND product_id IS NOT NULL))
);

-- ==========================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at 
            BEFORE UPDATE ON %I 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END;
$$;

-- ==========================================
-- TRIGGER: Update customer metrics on order
-- ==========================================
CREATE OR REPLACE FUNCTION update_customer_order_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.customer_id IS NOT NULL AND NEW.payment_status = 'paid' THEN
        UPDATE customers
        SET 
            total_spent = total_spent + NEW.total,
            total_orders = total_orders + 1,
            updated_at = NOW()
        WHERE id = NEW.customer_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_update_customer_metrics ON orders;
CREATE TRIGGER order_update_customer_metrics
AFTER INSERT OR UPDATE OF payment_status ON orders
FOR EACH ROW
WHEN (NEW.payment_status = 'paid')
EXECUTE FUNCTION update_customer_order_metrics();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
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
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ POLICIES (for storefront)
DROP POLICY IF EXISTS "Public: View visible collections" ON collections;
CREATE POLICY "Public: View visible collections" ON collections FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "Public: View active products" ON products;
CREATE POLICY "Public: View active products" ON products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public: View product variants" ON product_variants;
CREATE POLICY "Public: View product variants" ON product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public: View product options" ON product_options;
CREATE POLICY "Public: View product options" ON product_options FOR SELECT USING (true);

-- Reviews policy consolidated in section below

DROP POLICY IF EXISTS "Public: View active discounts" ON discounts;
CREATE POLICY "Public: View active discounts" ON discounts FOR SELECT USING (is_active = true AND starts_at <= NOW() AND (ends_at IS NULL OR ends_at > NOW()));

DROP POLICY IF EXISTS "Public: View published blog" ON blog_posts;
CREATE POLICY "Public: View published blog" ON blog_posts FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Public: View site config" ON site_config;
CREATE POLICY "Public: View site config" ON site_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public: View published pages" ON pages;
CREATE POLICY "Public: View published pages" ON pages FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public: View navigation" ON navigation_menus;
CREATE POLICY "Public: View navigation" ON navigation_menus FOR SELECT USING (true);

-- CUSTOMER POLICIES (for authenticated users)
DROP POLICY IF EXISTS "Customer: View own profile" ON customers;
CREATE POLICY "Customer: View own profile" ON customers FOR SELECT USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Customer: Update own profile" ON customers;
CREATE POLICY "Customer: Update own profile" ON customers FOR UPDATE USING ((select auth.uid()) = id);

-- Consolidating Multiple Permissive Policies for customer_addresses
DROP POLICY IF EXISTS "Customer: View own addresses" ON customer_addresses;
DROP POLICY IF EXISTS "Customer: Manage own addresses" ON customer_addresses;
CREATE POLICY "Customer: Manage own addresses" ON customer_addresses FOR ALL USING (customer_id = (select auth.uid()));

-- Consolidated Order Policies for Performance
DROP POLICY IF EXISTS "Orders: Manage all Admin" ON orders;
DROP POLICY IF EXISTS "Orders: Select own Customer" ON orders;
DROP POLICY IF EXISTS "Orders: Create own Customer" ON orders;
DROP POLICY IF EXISTS "Customer: View own orders" ON orders;
DROP POLICY IF EXISTS "Admin: View all orders" ON orders;
DROP POLICY IF EXISTS "Admin: Manage all orders" ON orders;
DROP POLICY IF EXISTS "Customer: Create orders" ON orders;
DROP POLICY IF EXISTS "Orders: Select Policy" ON orders;
DROP POLICY IF EXISTS "Orders: Insert Policy" ON orders;
DROP POLICY IF EXISTS "Orders: Update Policy" ON orders;
DROP POLICY IF EXISTS "Orders: Delete Policy" ON orders;

CREATE POLICY "Orders: Select Policy" ON orders FOR SELECT USING (
  customer_id = (select auth.uid()) OR 
  (select auth.jwt()) ->> 'role' = 'service_role' OR 
  ((select auth.jwt()) -> 'app_metadata' ->> 'role')::text = 'admin'
);

CREATE POLICY "Orders: Insert Policy" ON orders FOR INSERT WITH CHECK (
  customer_id = (select auth.uid()) OR 
  customer_id IS NULL OR
  (select auth.jwt()) ->> 'role' = 'service_role' OR 
  ((select auth.jwt()) -> 'app_metadata' ->> 'role')::text = 'admin'
);

CREATE POLICY "Orders: Update Policy" ON orders FOR UPDATE USING (
  (select auth.jwt()) ->> 'role' = 'service_role' OR 
  ((select auth.jwt()) -> 'app_metadata' ->> 'role')::text = 'admin'
);

CREATE POLICY "Orders: Delete Policy" ON orders FOR DELETE USING (
  (select auth.jwt()) ->> 'role' = 'service_role' OR 
  ((select auth.jwt()) -> 'app_metadata' ->> 'role')::text = 'admin'
);

DROP POLICY IF EXISTS "Customer: View order items" ON order_items;
CREATE POLICY "Customer: View order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.customer_id = (select auth.uid())));

DROP POLICY IF EXISTS "Customer: Manage own wishlist" ON wishlists;
CREATE POLICY "Customer: Manage own wishlist" ON wishlists FOR ALL USING (customer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Customer: Manage own cart" ON carts;
CREATE POLICY "Customer: Manage own cart" ON carts FOR ALL USING (customer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Customer: Manage cart items" ON cart_items;
CREATE POLICY "Customer: Manage cart items" ON cart_items FOR ALL USING (EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.customer_id = (select auth.uid())));

-- Consolidating Multiple Permissive Policies for reviews
DROP POLICY IF EXISTS "Customer: Submit reviews" ON reviews;
CREATE POLICY "Customer: Submit reviews" ON reviews FOR INSERT WITH CHECK (customer_id = (select auth.uid()));

DROP POLICY IF EXISTS "Public: View approved reviews" ON reviews;
DROP POLICY IF EXISTS "Customer: View own reviews" ON reviews;
DROP POLICY IF EXISTS "Reviews: Select approved or own" ON reviews;
CREATE POLICY "Reviews: Select approved or own" ON reviews FOR SELECT USING (
  status = 'approved' OR customer_id = (select auth.uid())
);

-- ==========================================
-- DEFAULT DATA SEEDS
-- ==========================================

-- Default site configuration
INSERT INTO site_config (key, value) VALUES 
('brand', '{
  "name": "SMPL",
  "tagline": "Timeless Wardrobe, Everyday Power",
  "announcement": "Free shipping on all orders this week",
  "showAnnouncement": true
}'::jsonb),
('homepage_layout', '[
  {"id": "hero", "type": "hero", "enabled": true, "order": 0},
  {"id": "categories", "type": "categories", "enabled": true, "order": 1},
  {"id": "featured", "type": "featured-products", "enabled": true, "order": 2},
  {"id": "benefits", "type": "benefits", "enabled": true, "order": 3},
  {"id": "news", "type": "news", "enabled": true, "order": 4}
]'::jsonb),
('hero', '{
  "heading": "Winter Collection",
  "subheading": "Discover the new trends",
  "image": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
  "ctaText": "Shop Now",
  "ctaLink": "/collection"
}'::jsonb),
('theme', '{
  "primaryColor": "#000000",
  "secondaryColor": "#ffffff",
  "backgroundColor": "#ffffff",
  "foregroundColor": "#000000",
  "font": "manrope",
  "borderRadius": "0.5rem"
}'::jsonb),
('social', '{
  "instagram": "",
  "twitter": "",
  "facebook": "",
  "tiktok": ""
}'::jsonb),
('currency', '{
  "code": "PKR",
  "symbol": "PKR Rs.",
  "format": "symbol amount"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Default navigation menus
INSERT INTO navigation_menus (handle, title, items) VALUES
('main-menu', 'Main Menu', '[
  {"label": "Collection", "url": "/collection"},
  {"label": "Product", "url": "/product"},
  {"label": "About", "url": "/about"},
  {"label": "Journal", "url": "/news"}
]'::jsonb),
('footer-menu', 'Footer Menu', '[
  {"label": "About Us", "url": "/about"},
  {"label": "Contact", "url": "/contact"},
  {"label": "Shipping", "url": "/shipping"},
  {"label": "Returns", "url": "/returns"}
]'::jsonb)
ON CONFLICT (handle) DO NOTHING;

-- Default shipping zone
INSERT INTO shipping_zones (name, countries) VALUES
('Domestic', '{"US", "CA"}')
ON CONFLICT DO NOTHING;

-- Default inventory location
INSERT INTO inventory_locations (name, is_default) VALUES
('Main Warehouse', true)
ON CONFLICT DO NOTHING;

-- ==========================================
-- USER OTPS (For Passwordless Auth)
-- ==========================================

CREATE TABLE IF NOT EXISTS user_otps (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  used boolean DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Clean up legacy index name if it exists
DROP INDEX IF EXISTS idx_otp_codes_email;
CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email);

ALTER TABLE user_otps ENABLE ROW LEVEL SECURITY;
-- Purely server-side access via service role/admin client

-- ==========================================
-- STORAGE CONFIGURATION
-- ==========================================

-- 1. Create Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('products', 'products', true, 6291456, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('collections', 'collections', true, 6291456, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Storage Policies (Products)
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products" ON storage.objects FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Auth Upload Products" ON storage.objects;
CREATE POLICY "Auth Upload Products" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'products' AND (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Products" ON storage.objects;
CREATE POLICY "Auth Update Products" ON storage.objects FOR UPDATE USING (bucket_id = 'products' AND (select auth.role()) = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Products" ON storage.objects;
CREATE POLICY "Auth Delete Products" ON storage.objects FOR DELETE USING (bucket_id = 'products' AND (select auth.role()) = 'authenticated');

-- 3. Storage Policies (Collections)
DROP POLICY IF EXISTS "Public Access Collections" ON storage.objects;
CREATE POLICY "Public Access Collections" ON storage.objects FOR SELECT USING (bucket_id = 'collections');

DROP POLICY IF EXISTS "Auth Upload Collections" ON storage.objects;
CREATE POLICY "Auth Upload Collections" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'collections' AND (select auth.role()) = 'authenticated');

-- 4. Storage Policies (Avatars)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "User Upload Avatar" ON storage.objects;
CREATE POLICY "User Upload Avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (select auth.role()) = 'authenticated');
