-- Indexes to optimize get_auth_users() RPC function performance
-- Run this in your Supabase SQL Editor

-- Index on profiles.id (primary key should already have this, but ensuring it exists)
-- This is critical for the JOIN with auth.users
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);

-- Index on profiles.created_at for fast ORDER BY
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- Composite index for the join and sort (most efficient)
-- This allows the database to use a single index for both the join and ordering
CREATE INDEX IF NOT EXISTS idx_profiles_id_created_at ON profiles(id, created_at DESC);

-- Note: auth.users.id is already indexed as it's the primary key
-- If you're still experiencing slowness, check:
-- 1. EXPLAIN ANALYZE on the query inside get_auth_users()
-- 2. Table statistics: SELECT reltuples, relpages FROM pg_class WHERE relname = 'profiles';
-- 3. Consider adding VACUUM ANALYZE profiles; to update statistics

