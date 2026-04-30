-- ==========================================
-- 10. NEWSLETTER
-- ==========================================

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. Anyone can subscribe (INSERT)
CREATE POLICY "Public: Subscribe to newsletter" 
  ON newsletter_subscribers 
  FOR INSERT 
  TO public 
  WITH CHECK (true);

-- 2. No public read access (Protect emails)
-- Service role (Admin) bypasses RLS for reading

-- 3. No public update access
-- Unsubscribe is handled via Admin API

SELECT 'Newsletter schema created!' as status;
