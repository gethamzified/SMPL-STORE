-- Indices for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- GIN Index for array overlap filtering on sizes
CREATE INDEX IF NOT EXISTS idx_products_available_sizes ON products USING GIN (available_sizes);

-- Function to sync available_sizes from variants to parent product
CREATE OR REPLACE FUNCTION sync_product_available_sizes()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the parent product's available_sizes based on all its active variants
    UPDATE products
    SET available_sizes = ARRAY(
        SELECT DISTINCT size
        FROM product_variants
        WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
          AND size IS NOT NULL
          AND size != ''
          AND status = 'active' -- Only consider active variants
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    RETURN NULL; -- Return value is ignored for AFTER triggers
END;
$$ LANGUAGE plpgsql;

-- Trigger to fire on INSERT, UPDATE, or DELETE of product_variants
DROP TRIGGER IF EXISTS trg_sync_product_sizes ON product_variants;

CREATE TRIGGER trg_sync_product_sizes
AFTER INSERT OR UPDATE OF size, status OR DELETE
ON product_variants
FOR EACH ROW
EXECUTE FUNCTION sync_product_available_sizes();

-- Run a one-time sync for existing data
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM products LOOP
        UPDATE products
        SET available_sizes = ARRAY(
            SELECT DISTINCT size
            FROM product_variants
            WHERE product_id = r.id
              AND size IS NOT NULL
              AND size != ''
              AND status = 'active'
        )
        WHERE id = r.id;
    END LOOP;
END;
$$;
