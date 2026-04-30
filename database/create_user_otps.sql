-- Create user_otps table for OTP-based authentication
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_otps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email);
CREATE INDEX IF NOT EXISTS idx_user_otps_email_expires ON user_otps(email, expires_at);

-- Enable Row Level Security
ALTER TABLE user_otps ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read OTPs (called from server-side API routes)
CREATE POLICY "Service role can manage OTPs" ON user_otps
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Optional: Auto-cleanup old OTPs (run periodically or via Supabase scheduled function)
-- DELETE FROM user_otps WHERE expires_at < NOW() - INTERVAL '1 hour';
