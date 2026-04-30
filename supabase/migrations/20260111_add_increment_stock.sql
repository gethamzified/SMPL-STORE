-- Migration: 20260111_add_increment_stock.sql
-- Description: Adds a function to increment stock (used when cancelling orders).

CREATE OR REPLACE FUNCTION increment_stock(
  product_id UUID,
  quantity INT,
  variant_id UUID DEFAULT NULL
) 
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET inventory_quantity = inventory_quantity + quantity
    WHERE id = variant_id;
  ELSE
    UPDATE products
    SET stock = stock + quantity
    WHERE id = product_id;
  END IF;
END;
$$;
