-- Migration: Add Payment Methods and Verification Columns
-- Description: Adds support for manual payment methods (Bank, Easypaisa, JazzCash) and verification workflow

-- 1. Create payment_method_type enum if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
    CREATE TYPE payment_method_type AS ENUM ('COD', 'bank_transfer', 'easypaisa', 'jazzcash', 'card');
  END IF;
END $$;

-- 2. Add new columns to orders table
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS transaction_id TEXT;

-- 3. Update payment_status check constraint to include new verification statuses
-- We first drop the existing check constraint safely
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;

-- Then add the updated constraint
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN (
    'pending', 
    'authorized', 
    'paid', 
    'partially_refunded', 
    'refunded', 
    'voided', 
    'failed', 
    'pending_verification', -- New: Customer uploaded proof, waiting for admin
    'cod_pending',          -- New: COD order placed, not yet delivered
    'proof_submitted'       -- New: Alternate name for pending_verification if needed
  ));

-- 4. Create storage bucket for payment proofs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Set up RLS policies for payment proofs bucket
-- Allow authenticated users to upload proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'payment-proofs' );

-- Allow public (or authenticated) to view proofs (so admin can see them)
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'payment-proofs' );
