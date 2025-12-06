-- Fix RLS policy to accept both 'full' and 'full_access' permissions
-- This fixes the issue where users with 'full' permission cannot insert leads

-- Drop the existing policy
DROP POLICY IF EXISTS "write_edit_leads" ON leads;

-- Recreate the policy to accept both 'full' and 'full_access'
CREATE POLICY "write_edit_leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.permission IN ('write', 'full_access', 'admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.permission IN ('write', 'full_access', 'admin', 'super_admin')
    )
  );

-- Also update the delete policy to accept 'full'
DROP POLICY IF EXISTS "full_access_delete_leads" ON leads;

CREATE POLICY "full_access_delete_leads"
  ON leads
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.permission IN  'full_access', 'admin', 'super_admin')
    )
  );
