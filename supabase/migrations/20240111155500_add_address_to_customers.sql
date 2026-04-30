-- Add address columns to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS address1 TEXT,
ADD COLUMN IF NOT EXISTS address2 TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS province TEXT,
ADD COLUMN IF NOT EXISTS zip TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'US',
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'US';

-- Copy data from customer_addresses (prioritizing default addresses)
-- This is a best-effort migration for the first address found if no default exists
DO $$
BEGIN
    UPDATE customers c
    SET 
        address1 = ca.address1,
        address2 = ca.address2,
        city = ca.city,
        province = ca.province,
        zip = ca.zip,
        country = ca.country
    FROM customer_addresses ca
    WHERE c.id = ca.customer_id
    AND (ca.is_default = true OR ca.id = (
        SELECT id FROM customer_addresses 
        WHERE customer_id = c.id 
        ORDER BY created_at DESC 
        LIMIT 1
    ));
END $$;

-- Drop the customer_addresses table
DROP TABLE IF EXISTS customer_addresses;
