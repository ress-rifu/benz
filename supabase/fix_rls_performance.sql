-- =====================================================
-- MIGRATION: Fix RLS Performance and Duplicate Issues
-- This migration addresses Supabase linter warnings:
-- 1. auth_rls_initplan: Wrap auth.uid() in (select ...) for performance
-- 2. multiple_permissive_policies: Consolidate duplicate policies
-- 3. duplicate_index: Remove duplicate indexes
-- =====================================================

-- =====================================================
-- PART 1: FIX DUPLICATE INDEXES
-- =====================================================

-- Drop duplicate indexes on invoice_items
DROP INDEX IF EXISTS idx_invoice_items_inventory;
-- Keep idx_invoice_items_part_id

-- Drop duplicate indexes on part_stock_logs
DROP INDEX IF EXISTS idx_inventory_logs_invoice;
-- Keep idx_part_stock_logs_invoice_id

DROP INDEX IF EXISTS idx_inventory_logs_item;
-- Keep idx_part_stock_logs_part_id

DROP INDEX IF EXISTS idx_inventory_logs_user;
-- Keep idx_part_stock_logs_user_id

-- =====================================================
-- PART 2: FIX MULTIPLE PERMISSIVE POLICIES ON part_stock_logs
-- Consolidate duplicate SELECT and INSERT policies
-- =====================================================

-- Drop duplicate policies on part_stock_logs
DROP POLICY IF EXISTS "Admins can read inventory logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can view all part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can create part stock logs" ON part_stock_logs;
-- Also drop the new policy names in case of re-running this migration
DROP POLICY IF EXISTS "Admins can view part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert part stock logs" ON part_stock_logs;

-- Recreate consolidated policies with (select auth.uid()) optimization
CREATE POLICY "Admins can view part stock logs" ON part_stock_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert part stock logs" ON part_stock_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PART 3: FIX MULTIPLE PERMISSIVE POLICIES ON users TABLE
-- Keep "Users can read own profile" and update "Super admins can read all users"
-- They have different purposes so we need to optimize them
-- =====================================================

-- Drop and recreate users RLS policies with (select auth.uid()) optimization
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Super admins can read all users" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;
DROP POLICY IF EXISTS "Allow self registration" ON users;
-- Also drop the new consolidated policy name in case of re-running
DROP POLICY IF EXISTS "Users can read profiles" ON users;

-- Consolidated SELECT policy: Users can read own profile OR super admins can read all
-- This combines both policies into one to avoid multiple permissive policy overhead
CREATE POLICY "Users can read profiles" ON users
  FOR SELECT
  USING (
    (select auth.uid()) = id
    OR
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'super_admin'
    )
  );

-- Super admins can delete users (optimized)
CREATE POLICY "Super admins can delete users" ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = (select auth.uid())
      AND u.role = 'super_admin'
    )
    AND (select auth.uid()) != id
  );

-- Allow self registration (optimized)
CREATE POLICY "Allow self registration" ON users
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);

-- =====================================================
-- PART 4: FIX RLS POLICIES ON invoices TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can update own invoices" ON invoices;

CREATE POLICY "Admins can update own invoices" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = (select auth.uid())
      AND users.role = 'super_admin'
    )
    OR 
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = (select auth.uid())
        AND users.role IN ('admin', 'super_admin')
      )
      AND created_by = (select auth.uid())
    )
  );

-- =====================================================
-- PART 5: FIX RLS POLICIES ON invoice_items TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admins can update invoice items" ON invoice_items;

CREATE POLICY "Admins can update invoice items" ON invoice_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_items.invoice_id
      AND (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = (select auth.uid())
          AND users.role = 'super_admin'
        )
        OR invoices.created_by = (select auth.uid())
      )
    )
  );

-- =====================================================
-- PART 6: FIX RLS POLICIES ON service_categories TABLE
-- =====================================================

DROP POLICY IF EXISTS "service_categories_select_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_insert_super_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_update_super_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_delete_super_admin" ON service_categories;

CREATE POLICY "service_categories_select_admin" ON service_categories
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "service_categories_insert_super_admin" ON service_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "service_categories_update_super_admin" ON service_categories
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "service_categories_delete_super_admin" ON service_categories
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 7: FIX RLS POLICIES ON services TABLE
-- =====================================================

DROP POLICY IF EXISTS "services_select_admin" ON services;
DROP POLICY IF EXISTS "services_insert_super_admin" ON services;
DROP POLICY IF EXISTS "services_update_super_admin" ON services;
DROP POLICY IF EXISTS "services_delete_super_admin" ON services;

CREATE POLICY "services_select_admin" ON services
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "services_insert_super_admin" ON services
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "services_update_super_admin" ON services
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "services_delete_super_admin" ON services
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 8: FIX RLS POLICIES ON part_categories TABLE
-- =====================================================

DROP POLICY IF EXISTS "part_categories_select_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_insert_super_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_update_super_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_delete_super_admin" ON part_categories;

CREATE POLICY "part_categories_select_admin" ON part_categories
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "part_categories_insert_super_admin" ON part_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "part_categories_update_super_admin" ON part_categories
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "part_categories_delete_super_admin" ON part_categories
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 9: FIX RLS POLICIES ON part_brands TABLE
-- =====================================================

DROP POLICY IF EXISTS "part_brands_select_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_insert_super_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_update_super_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_delete_super_admin" ON part_brands;

CREATE POLICY "part_brands_select_admin" ON part_brands
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "part_brands_insert_super_admin" ON part_brands
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "part_brands_update_super_admin" ON part_brands
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "part_brands_delete_super_admin" ON part_brands
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 10: FIX RLS POLICIES ON parts TABLE
-- =====================================================

DROP POLICY IF EXISTS "parts_select_admin" ON parts;
DROP POLICY IF EXISTS "parts_insert_super_admin" ON parts;
DROP POLICY IF EXISTS "parts_update_super_admin" ON parts;
DROP POLICY IF EXISTS "parts_delete_super_admin" ON parts;

CREATE POLICY "parts_select_admin" ON parts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "parts_insert_super_admin" ON parts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "parts_update_super_admin" ON parts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

CREATE POLICY "parts_delete_super_admin" ON parts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- PART 11: FIX RLS POLICIES ON customers TABLE
-- =====================================================

DROP POLICY IF EXISTS "customers_select_admin" ON customers;
DROP POLICY IF EXISTS "customers_insert_admin" ON customers;
DROP POLICY IF EXISTS "customers_update_admin" ON customers;
DROP POLICY IF EXISTS "customers_delete_super_admin" ON customers;

CREATE POLICY "customers_select_admin" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_insert_admin" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_update_admin" ON customers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_delete_super_admin" ON customers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (select auth.uid())
      AND role = 'super_admin'
    )
  );
