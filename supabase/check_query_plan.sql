-- Check the query execution plan to see what's slow
-- Run this to see exactly what the database is doing

EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT 
    p.id,
    p.full_name,
    p.permission::text as permission,
    p.status::text as status,
    au.email
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id
ORDER BY p.created_at DESC NULLS LAST;

-- Look for:
-- - "Seq Scan" (bad - means full table scan)
-- - "Index Scan" or "Index Only Scan" (good)
-- - High "Execution Time" 
-- - High "Buffers: shared hit/read"

-- If you see "Seq Scan" on profiles, the indexes aren't being used!

