-- ==========================================
-- 01. EXTENSIONS & CORE FUNCTIONS
-- Run this second (after 00_drop_all.sql)
-- ==========================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable text search for product search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Universal timestamp update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

SELECT 'Extensions and core functions ready!' as status;
