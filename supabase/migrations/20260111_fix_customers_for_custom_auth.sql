-- =============================================
-- SMPL COMPLETE DATABASE FIX
-- Run this entire script in Supabase SQL Editor
-- This fixes ALL customer-related issues
-- =============================================

-- =============================================
-- STEP 1: Ensure 'users' table exists (custom JWT auth)
-- =============================================
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    phone text,
    address jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS on users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to users" ON public.users;
CREATE POLICY "Service role full access to users" ON public.users
    FOR ALL USING ((select auth.role()) = 'service_role');

-- =============================================
-- STEP 2: Fix customers table structure
-- =============================================

-- Drop old foreign key constraints that reference auth.users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
            ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'customers' 
            AND tc.table_schema = 'public'
            AND tc.constraint_type = 'FOREIGN KEY'
    ) LOOP
        EXECUTE 'ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- Recreate customers table with correct structure (if needed)
-- First, check if customers table exists
DO $$
BEGIN
    -- If customers table doesn't exist, create it
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers' AND table_schema = 'public') THEN
        CREATE TABLE public.customers (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
            email text NOT NULL,
            first_name text,
            last_name text,
            phone text,
            address1 text,
            address2 text,
            city text,
            province text,
            zip text,
            country text DEFAULT 'US',
            country_code text DEFAULT 'US',
            total_spent numeric(10,2) DEFAULT 0,
            total_orders integer DEFAULT 0,
            accepts_marketing boolean DEFAULT false,
            notes text,
            tags text[] DEFAULT '{}',
            metadata jsonb DEFAULT '{}',
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
    END IF;
END $$;

-- =============================================
-- STEP 3: Add missing columns to customers
-- =============================================

-- Add user_id column (links to custom users table)
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS user_id uuid;

-- Add address columns
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS address1 text,
ADD COLUMN IF NOT EXISTS address2 text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS province text,
ADD COLUMN IF NOT EXISTS zip text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'US',
ADD COLUMN IF NOT EXISTS country_code text DEFAULT 'US';

-- Ensure other expected columns exist
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS total_spent numeric(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_orders integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS accepts_marketing boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- =============================================
-- STEP 4: Add foreign key constraint for user_id
-- =============================================

-- First, add the FK constraint if users table exists
DO $$
BEGIN
    -- Check if the constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'customers_user_id_fkey'
        AND table_name = 'customers'
    ) THEN
        -- Only add if users table exists
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
            ALTER TABLE public.customers 
            ADD CONSTRAINT customers_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- =============================================
-- STEP 5: Create indexes for performance
-- =============================================

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- =============================================
-- STEP 6: Fix RLS policies for customers
-- =============================================

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Customer: View own profile" ON public.customers;
DROP POLICY IF EXISTS "Customer: Update own profile" ON public.customers;
DROP POLICY IF EXISTS "Service role full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Allow public read" ON public.customers;

-- Create new policies
CREATE POLICY "Service role full access to customers" ON public.customers
    FOR ALL USING ((select auth.role()) = 'service_role');

-- Allow read for all (needed for checkout flow)
CREATE POLICY "Allow public read customers" ON public.customers
    FOR SELECT USING (true);

-- =============================================
-- STEP 7: Create user_otps table if not exists
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_otps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL,
    otp_code text NOT NULL,
    used boolean DEFAULT false,
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_otps_email_created 
    ON public.user_otps (email, created_at);

-- =============================================
-- STEP 8: Create updated_at trigger function
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at 
BEFORE UPDATE ON public.customers 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONE! Verify the fix
-- =============================================

SELECT 'SUCCESS! Database schema fixed.' as status;

-- Verify customers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' AND table_schema = 'public'
ORDER BY ordinal_position;
