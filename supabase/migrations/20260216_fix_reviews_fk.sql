-- Fix reviews foreign key to allow order_items deletion
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_verified_order_item_id_fkey;

ALTER TABLE reviews
ADD CONSTRAINT reviews_verified_order_item_id_fkey
FOREIGN KEY (verified_order_item_id)
REFERENCES order_items(id)
ON DELETE SET NULL;
