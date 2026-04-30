-- Phase 2: Remove Duplicate Cart System
-- Run this in Supabase SQL Editor AFTER verifying no code uses user_cart

-- First, verify there's no data we need to migrate
-- SELECT COUNT(*) FROM user_cart;

-- If count is 0 or data is stale, proceed:
DROP TABLE IF EXISTS user_cart;

SELECT 'Phase 2: user_cart table removed!' as status;
