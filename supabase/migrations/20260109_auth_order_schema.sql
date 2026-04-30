-- =============================================
-- SMPL DATABASE SCHEMA UPDATE
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create `users` table (if not exists)
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    phone text,
    address jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/update their own data
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.users;
CREATE POLICY "Users can manage their own profile" ON public.users
    FOR ALL USING ((select auth.uid()) = id OR (select auth.role()) = 'service_role');

-- 2. Clean up old otp_codes and ensure user_otps exists
DO $$
BEGIN
    -- If old table exists and new one doesn't, rename it
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'otp_codes') 
       AND NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_otps') THEN
        ALTER TABLE public.otp_codes RENAME TO user_otps;
    -- If both exist, just drop the old one
    ELSIF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'otp_codes') 
          AND EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_otps') THEN
        DROP TABLE public.otp_codes;
    END IF;
END $$;

-- Create user_otps if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_otps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    otp_code text NOT NULL,
    used boolean DEFAULT false,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Add used column if not present
ALTER TABLE public.user_otps ADD COLUMN IF NOT EXISTS used boolean DEFAULT false;

-- Clean up duplicate indexes
DROP INDEX IF EXISTS public.idx_otp_codes_email;

-- Rate limiting index
CREATE INDEX IF NOT EXISTS idx_user_otps_email_created 
    ON public.user_otps (email, created_at);

-- 3. Create `user_cart` table
CREATE TABLE IF NOT EXISTS public.user_cart (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    variant_id uuid,
    quantity integer NOT NULL DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, product_id, variant_id)
);

-- Enable RLS
ALTER TABLE public.user_cart ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own cart
DROP POLICY IF EXISTS "Users can manage their own cart" ON public.user_cart;
CREATE POLICY "Users can manage their own cart" ON public.user_cart
    FOR ALL USING ((select auth.uid()) = user_id OR (select auth.role()) = 'service_role');

-- 4. Add payment_proof to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_proof jsonb;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;

-- 5. Create decrement_stock RPC
CREATE OR REPLACE FUNCTION decrement_stock(p_id uuid, qty integer)
RETURNS void AS $$
BEGIN
    UPDATE products SET stock = stock - qty WHERE id = p_id AND stock >= qty;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Insufficient stock for product %', p_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. Create payment-proofs storage bucket (run this manually if needed)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);

-- =============================================
-- DONE! Your database is now ready for the new auth & order system.
-- =============================================
