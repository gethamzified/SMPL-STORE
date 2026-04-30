-- ==========================================
-- SUPABASE STORAGE CONFIGURATION
-- ==========================================
-- Run this in the Supabase SQL Editor to set up storage buckets and policies

-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
-- Create main products bucket (public for product images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'products', 
  'products', 
  true,
  6291456, -- 6MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create collections bucket (for collection cover images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'collections', 
  'collections', 
  true,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create avatars bucket (for customer profile images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true,
  2097152, -- 2MB limit for avatars
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ==========================================
-- STORAGE POLICIES - PRODUCTS BUCKET
-- ==========================================
-- Allow public read access to all product images
DROP POLICY IF EXISTS "Public Access Products" ON storage.objects;
CREATE POLICY "Public Access Products" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'products');

-- Allow authenticated users (admins) to upload
DROP POLICY IF EXISTS "Auth Upload Products" ON storage.objects;
CREATE POLICY "Auth Upload Products" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
  
-- Allow authenticated users to update
DROP POLICY IF EXISTS "Auth Update Products" ON storage.objects;
CREATE POLICY "Auth Update Products" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
DROP POLICY IF EXISTS "Auth Delete Products" ON storage.objects;
CREATE POLICY "Auth Delete Products" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

-- ==========================================
-- STORAGE POLICIES - COLLECTIONS BUCKET
-- ==========================================
DROP POLICY IF EXISTS "Public Access Collections" ON storage.objects;
CREATE POLICY "Public Access Collections" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'collections');

DROP POLICY IF EXISTS "Auth Upload Collections" ON storage.objects;
CREATE POLICY "Auth Upload Collections" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'collections' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Update Collections" ON storage.objects;
CREATE POLICY "Auth Update Collections" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'collections' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth Delete Collections" ON storage.objects;
CREATE POLICY "Auth Delete Collections" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'collections' AND auth.role() = 'authenticated');

-- ==========================================
-- STORAGE POLICIES - AVATARS BUCKET
-- ==========================================
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

-- Users can upload their own avatar
DROP POLICY IF EXISTS "User Upload Avatar" ON storage.objects;
CREATE POLICY "User Upload Avatar" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "User Update Avatar" ON storage.objects;
CREATE POLICY "User Update Avatar" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "User Delete Avatar" ON storage.objects;
CREATE POLICY "User Delete Avatar" 
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
