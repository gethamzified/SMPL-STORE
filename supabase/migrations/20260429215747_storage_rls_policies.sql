-- Add Storage RLS policies to allow authenticated admin uploads

DO $$ 
BEGIN
    -- Enable RLS on storage.objects if not already enabled
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist to ensure idempotency
    DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Insert Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Update Access" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated Delete Access" ON storage.objects;

    -- Create public read access for all objects
    CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (true);

    -- Create authenticated write access
    CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "Authenticated Update Access" ON storage.objects FOR UPDATE TO authenticated USING (true);
    CREATE POLICY "Authenticated Delete Access" ON storage.objects FOR DELETE TO authenticated USING (true);
END $$;
