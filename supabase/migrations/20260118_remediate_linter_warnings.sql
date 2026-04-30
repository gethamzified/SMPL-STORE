-- =============================================
-- DATABASE LINTER REMEDIATION
-- Target: Performance & Redundancy Fixes
-- =============================================

-- 1. OPTIMIZE RLS POLICIES
-- Replacing auth.uid() with (SELECT auth.uid()) prevents re-evaluation for every row.

-- public.users
DROP POLICY IF EXISTS "Users: Manage own profile" ON public.users;
CREATE POLICY "Users: Manage own profile" ON public.users
    FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = id)
    WITH CHECK ((SELECT auth.uid()) = id);

-- public.user_cart
DROP POLICY IF EXISTS "Users: Manage own cart" ON public.user_cart;
CREATE POLICY "Users: Manage own cart" ON public.user_cart
    FOR ALL
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);


-- 2. REMOVE DUPLICATE INDEXES
-- Keeping the Standard idx_<table_name>_<col> naming convention from 20260114_optimize_schema.sql

-- public.blog_posts
DROP INDEX IF EXISTS public.idx_blog_status;

-- public.customers
DROP INDEX IF EXISTS public.idx_customers_user_id;

-- public.product_options
DROP INDEX IF EXISTS public.idx_options_product;

-- public.product_variants
DROP INDEX IF EXISTS public.idx_variants_product;

-- public.wishlists
DROP INDEX IF EXISTS public.idx_wishlist_customer;
DROP INDEX IF EXISTS public.idx_wishlist_product;

-- 3. VERIFY
SELECT 'SUCCESS! Linter remediations applied.' as status;
