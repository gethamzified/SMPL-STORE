-- Add missing variant configuration columns to products table
-- These columns support the clothing variant system (color/size)

-- Enable flags
ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_color_variants boolean DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS enable_size_variants boolean DEFAULT false;

-- Available options arrays
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_colors text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS available_sizes text[] DEFAULT '{}';

-- Also add color/size fields to product_variants if missing
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE product_variants ADD COLUMN IF NOT EXISTS size text;

SELECT 'Variant columns added successfully!' as status;
