-- QUICK FIX: Add critical indexes for get_auth_users() performance
-- Run this FIRST in your Supabase SQL Editor

-- 1. Index on profiles.id (for the JOIN) - CRITICAL
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- 2. Index on profiles.created_at (for ORDER BY) - CRITICAL  
CREATE INDEX IF NOT EXISTS idx_profiles_created_at_desc ON profiles(created_at DESC NULLS LAST);

-- 3. Update table statistics so query planner makes good decisions
VACUUM ANALYZE profiles;

-- 4. Test the function again - should be much faster now
-- SELECT * FROM get_auth_users();

