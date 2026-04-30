-- ==========================================
-- CLOTHING VARIANT SYSTEM MIGRATION
-- Adds clothing-specific variant fields (color, size, status)
-- ==========================================

-- Add explicit clothing-specific columns to variants
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Add constraint for status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'product_variants_status_check'
  ) THEN
    ALTER TABLE product_variants ADD CONSTRAINT product_variants_status_check 
      CHECK (status IN ('active', 'disabled'));
  END IF;
END $$;

-- Rename inventory_quantity to stock for consistency (if not already)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_variants' AND column_name = 'inventory_quantity'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'product_variants' AND column_name = 'stock'
  ) THEN
    ALTER TABLE product_variants RENAME COLUMN inventory_quantity TO stock;
  END IF;
END $$;

-- Add product-level variant configuration
ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_color_variants BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_size_variants BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_colors TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_sizes TEXT[] DEFAULT '{}';

-- Create index for variant lookups
CREATE INDEX IF NOT EXISTS idx_variants_color ON product_variants(color) WHERE color IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variants_size ON product_variants(size) WHERE size IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_variants_status ON product_variants(status);

-- ==========================================
-- COMMENTS
-- ==========================================
COMMENT ON COLUMN product_variants.color IS 'Clothing color variant (e.g., Black, White, Navy)';
COMMENT ON COLUMN product_variants.size IS 'Clothing size variant (e.g., S, M, L, XL)';
COMMENT ON COLUMN product_variants.status IS 'Variant availability: active or disabled';
COMMENT ON COLUMN products.enable_color_variants IS 'Enable color variant generation for this product';
COMMENT ON COLUMN products.enable_size_variants IS 'Enable size variant generation for this product';
COMMENT ON COLUMN products.available_colors IS 'List of available colors for variant generation';
COMMENT ON COLUMN products.available_sizes IS 'List of available sizes for variant generation';
