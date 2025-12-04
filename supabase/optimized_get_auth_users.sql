-- Optimized version of get_auth_users() RPC function
-- This version includes performance optimizations

-- Drop the old function
DROP FUNCTION IF EXISTS get_auth_users();

-- Create optimized function
CREATE OR REPLACE FUNCTION get_auth_users()
RETURNS TABLE (
  id uuid,
  full_name text,
  permission text,
  status text,
  email text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  -- Use explicit index hints and limit if needed
  -- The ORDER BY is kept but should be fast with proper indexes
  SELECT 
    p.id,
    p.full_name,
    p.permission::text as permission,
    p.status::text as status,
    au.email
  FROM profiles p
  INNER JOIN auth.users au ON p.id = au.id
  -- Ensure we're using indexes efficiently
  WHERE p.id IS NOT NULL  -- Helps query planner
  ORDER BY p.created_at DESC NULLS LAST
  -- Uncomment and adjust if you have many users and want pagination:
  -- LIMIT 1000
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users() TO service_role;

-- ALTERNATIVE: If you have many users, consider a materialized view approach:
/*
CREATE MATERIALIZED VIEW IF NOT EXISTS auth_users_view AS
SELECT 
    p.id,
    p.full_name,
    p.permission::text as permission,
    p.status::text as status,
    au.email,
    p.created_at
FROM profiles p
INNER JOIN auth.users au ON p.id = au.id;

CREATE UNIQUE INDEX ON auth_users_view(id);
CREATE INDEX ON auth_users_view(created_at DESC);

-- Refresh the view periodically (set up a cron job)
-- REFRESH MATERIALIZED VIEW auth_users_view;
*/

