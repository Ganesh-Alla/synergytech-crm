-- Diagnostic queries to identify performance bottlenecks in get_auth_users()
-- Run these in your Supabase SQL Editor to diagnose the issue

-- 1. Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE tablename IN ('profiles')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 2. Check if indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND tablename = 'profiles'
    AND (indexname LIKE '%id%' OR indexname LIKE '%created_at%')
ORDER BY tablename, indexname;

-- 3. Analyze the query execution plan (this shows what the database is doing)
EXPLAIN ANALYZE
SELECT 
    p.id,
    p.full_name,
    p.permission::text as permission,
    p.status::text as status,
    au.email
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC NULLS LAST;

-- 4. Check for missing statistics (run VACUUM ANALYZE if needed)
SELECT 
    schemaname,
    tablename,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'profiles';

-- 5. If statistics are old, update them:
-- VACUUM ANALYZE profiles;

-- 6. Test the RPC function directly with timing
\timing on
SELECT * FROM get_auth_users();
\timing off

