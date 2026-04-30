-- ==========================================
-- 01. EXTENSIONS & SETUP
-- Run this first
-- ==========================================

-- Enable standard UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable text search capabilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Update Timestamp Function (Used by all tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
