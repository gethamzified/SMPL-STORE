-- Add admin_message column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS admin_message TEXT;

-- Enable RLS on orders if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own orders
CREATE POLICY "Users can view own orders" 
ON orders FOR SELECT 
USING (auth.uid() = customer_id);

-- Policy: Admins can view all orders
-- Assuming admin role in auth.users or similar mechanism.
-- For simple checking, we often use a custom claim or a separate admins table.
-- Here, assuming Supabase Service Role usage for Admin App or a specific RLS.
-- For now, let's allow "service_role" full access implies by default, 
-- but we need a policy for "Admins" if they log in via frontend.
-- Let's stick to: Authenticated users can see their own. 
-- Admins using the Admin Panel likely use the Service Role Client (bypass RLS) 
-- or we need a policy checking user metadata.
-- I will add a generic "Admins can do everything" policy checking metadata for future proofing.

CREATE POLICY "Admins can  do everything" 
ON orders 
USING (
  auth.jwt() ->> 'role' = 'service_role' 
  OR 
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
);

-- Policy: Users can create orders (checkout)
CREATE POLICY "Users can create orders" 
ON orders FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Policy: Only Admins can update orders
CREATE POLICY "Admins can update orders" 
ON orders FOR UPDATE 
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
  OR
  auth.jwt() ->> 'role' = 'service_role'
);
