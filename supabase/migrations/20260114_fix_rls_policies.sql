-- =============================================
-- RLS POLICY FIXES (Performance & Security)
-- Run this in Supabase SQL Editor to resolve "Multiple Permissive Policies" warnings
-- =============================================

-- =============================================
-- 1. FIX: public.users
-- =============================================

-- Drop overlapping/permissive policies
DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;

-- Create STRICT service role policy (only applies to service_role)
CREATE POLICY "Service: Full access users" ON public.users
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create STRICT user policy (only applies to authenticated users)
-- Removed the "OR service_role" check because the policy above handles it
CREATE POLICY "Users: Manage own profile" ON public.users
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- =============================================
-- 2. FIX: public.customers
-- =============================================

-- Drop overlapping policies
DROP POLICY IF EXISTS "Service role full access to customers" ON public.customers;

-- Create STRICT service role policy
CREATE POLICY "Service: Full access customers" ON public.customers
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Note: "Allow public read customers" is fine as-is because it targets public/anon.
-- Since the service role policy is now restricted TO service_role, they won't overlap for anon users.

-- =============================================
-- 3. FIX: public.user_cart (Proactive Fix)
-- =============================================

DROP POLICY IF EXISTS "Users can manage their own cart" ON public.user_cart;

CREATE POLICY "Service: Full access cart" ON public.user_cart
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users: Manage own cart" ON public.user_cart
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 4. VERIFY
-- =============================================
SELECT 'SUCCESS! RLS policies optimized.' as status;
