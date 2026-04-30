-- ==========================================
-- 04. CUSTOMERS & AUTH (Routes: /register, /login, /admin/customers)
-- Run this fifth
-- ==========================================

-- Customer Profiles
CREATE TABLE customers (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  
  -- Customer Analytics
  total_spent NUMERIC(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  
  -- Marketing Preferences
  accepts_marketing BOOLEAN DEFAULT false,
  marketing_updated_at TIMESTAMPTZ,
  
  -- Admin Notes
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Customer Shipping/Billing Addresses
CREATE TABLE customer_addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  
  -- Address Details
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
  
  -- Address Flags
  is_default BOOLEAN DEFAULT false,
  address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);

-- Triggers
CREATE TRIGGER update_customers_updated_at 
BEFORE UPDATE ON customers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at 
BEFORE UPDATE ON customer_addresses 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Customers & Auth tables ready!' as status;
