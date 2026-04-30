-- ==========================================
-- RECONCILIATION SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX "COLUMN NOT FOUND" ERRORS
-- ==========================================

-- 1. Ensure PRODUCTS table has all required columns
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Ensure COLLECTIONS table has SEO columns and NO hover_image_url
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Drop hover_image_url if it still exists (it was removed from codebase)
ALTER TABLE collections 
DROP COLUMN IF EXISTS hover_image_url;

-- 3. Create Indexes for new columns if missing
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(published_at);

-- 4. CRITICAL: Force Supabase to reload the schema cache
-- This fixes the "Could not find column" error immediately
NOTIFY pgrst, 'reload schema';

-- Verification (Optional - will print current columns)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('seo_description', 'published_at', 'category_id', 'product_type');
