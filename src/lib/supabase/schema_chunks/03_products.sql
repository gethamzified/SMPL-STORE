-- ==========================================
-- 03. PRODUCTS ECOSYSTEM (Routes: /product/[slug], /admin/products)
-- Run this fourth
-- ==========================================

-- Main Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(10,2),
  cost_per_item NUMERIC(10,2),
  
  -- Media
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
  
  -- Organization & SEO
  category_id UUID REFERENCES collections(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  vendor TEXT,
  product_type TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  
  -- Meta
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  published_at TIMESTAMPTZ
);

-- Product Variants (Size, Color, etc.)
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  
  -- Variant Options (Shopify style)
  option1_name TEXT DEFAULT 'Size',
  option1_value TEXT,
  option2_name TEXT DEFAULT 'Color',
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  
  -- Pricing (overrides product price)
  price NUMERIC(10,2),
  sale_price NUMERIC(10,2),
  
  -- Inventory
  sku TEXT UNIQUE,
  barcode TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Product Options (Dynamic variant definitions)
CREATE TABLE product_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  values TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Performance Indexes
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_options_product ON product_options(product_id);

-- Triggers
CREATE TRIGGER update_products_updated_at 
BEFORE UPDATE ON products 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_variants_updated_at 
BEFORE UPDATE ON product_variants 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Products ecosystem ready!' as status;
