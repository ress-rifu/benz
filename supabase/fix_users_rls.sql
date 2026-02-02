-- =====================================================
-- FIX: Restore Original Users Table RLS Policies
-- The "Users can read profiles" policy had a circular dependency issue:
-- Checking super_admin role required querying users table → triggers same RLS
-- 
-- Solution: Restore separate policies for own profile and super_admin access
-- =====================================================

-- Drop the problematic consolidated policy
DROP POLICY IF EXISTS "Users can read profiles" ON users;

-- Restore original policy: Users can ALWAYS read their own profile
-- This policy uses simple id check, no circular dependency
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING ((select auth.uid()) = id);

-- Super admin policy: Allow reading other users
-- This works because the user reading their own profile is handled above
CREATE POLICY "Super admins can read all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'super_admin'
    )
  );
