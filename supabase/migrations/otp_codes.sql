CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- RLS (Service Role only should access this really, but for actions we use admin client)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
-- No public policies needed as we only access via server action using admin client
