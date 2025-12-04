-- RPC function to get profiles with auth user emails
-- This function joins profiles table with auth.users to get email addresses
-- Run this in your Supabase SQL Editor

-- STEP 1: First, check your actual column types by running this query:
-- SELECT column_name, data_type, udt_name, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'profiles'
-- ORDER BY ordinal_position;

-- STEP 2: Drop the function if it exists
DROP FUNCTION IF EXISTS get_auth_users();

-- STEP 3: Create the function
-- This version properly handles enum types (permission_level and status) by casting them to text
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
  SELECT 
    p.id,
    p.full_name,
    p.permission::text as permission,
    p.status::text as status,
    au.email
  FROM profiles p
  INNER JOIN auth.users au ON p.id = au.id
  ORDER BY p.created_at DESC NULLS LAST;
$$;


-- Grant execute permission to authenticated users (adjust as needed)
-- You may want to restrict this further based on your security requirements
GRANT EXECUTE ON FUNCTION get_auth_users() TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_users() TO service_role;

