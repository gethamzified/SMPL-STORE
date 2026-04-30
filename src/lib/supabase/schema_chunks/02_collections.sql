-- ==========================================
-- 02. COLLECTIONS (Categories/Routes: /collection, /admin/collections)
-- Run this third
-- ==========================================

CREATE TABLE collections (
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

-- Indexes for performance
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_collections_visible ON collections(is_visible) WHERE is_visible = true;
CREATE INDEX idx_collections_sort ON collections(sort_order, created_at);

-- Auto-update timestamp trigger
CREATE TRIGGER update_collections_updated_at 
BEFORE UPDATE ON collections 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Collections table ready!' as status;
