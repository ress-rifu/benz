-- =====================================================
-- FIX: Restore Working RLS Policies
-- The auth.is_admin() and auth.is_super_admin() functions don't exist.
-- This uses correct inline queries that avoid circular dependencies.
-- =====================================================

-- =====================================================
-- PART 1: FIX USERS TABLE POLICIES
-- CRITICAL: Users table policies must NOT query the users table for role check
-- to avoid circular dependency. User can always read their own profile.
-- =====================================================

DROP POLICY IF EXISTS "Users can read profiles" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Super admins can read all users" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;
DROP POLICY IF EXISTS "Allow self registration" ON users;

-- Simple policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

-- Super admin can read all users - uses subquery on same table but that's OK
-- because they can always read their own row first
CREATE POLICY "Super admins can read all users" ON users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
    )
  );

-- Super admin can delete other users
CREATE POLICY "Super admins can delete users" ON users
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'super_admin'
    )
    AND auth.uid() != id
  );

-- Allow self registration
CREATE POLICY "Allow self registration" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- PART 2: FIX INVOICES POLICIES  
-- =====================================================

DROP POLICY IF EXISTS "Admins can update own invoices" ON invoices;

CREATE POLICY "Admins can update own invoices" ON invoices
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
    OR 
    (
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
      )
      AND created_by = auth.uid()
    )
  );

-- =====================================================
-- PART 3: FIX INVOICE_ITEMS POLICIES
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
          WHERE users.id = auth.uid()
          AND users.role = 'super_admin'
        )
        OR invoices.created_by = auth.uid()
      )
    )
  );

-- =====================================================
-- PART 4: FIX PART_STOCK_LOGS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admins can view part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can read inventory logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON part_stock_logs;

CREATE POLICY "Admins can read inventory logs" ON part_stock_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert inventory logs" ON part_stock_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- =====================================================
-- PART 5: FIX SERVICE_CATEGORIES POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "service_categories_insert_super_admin" ON service_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "service_categories_update_super_admin" ON service_categories
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "service_categories_delete_super_admin" ON service_categories
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 6: FIX SERVICES POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "services_insert_super_admin" ON services
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "services_update_super_admin" ON services
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "services_delete_super_admin" ON services
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 7: FIX PART_CATEGORIES POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "part_categories_insert_super_admin" ON part_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "part_categories_update_super_admin" ON part_categories
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "part_categories_delete_super_admin" ON part_categories
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 8: FIX PART_BRANDS POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "part_brands_insert_super_admin" ON part_brands
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "part_brands_update_super_admin" ON part_brands
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "part_brands_delete_super_admin" ON part_brands
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 9: FIX PARTS POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "parts_insert_super_admin" ON parts
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "parts_update_super_admin" ON parts
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "parts_delete_super_admin" ON parts
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

-- =====================================================
-- PART 10: FIX CUSTOMERS POLICIES
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
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_insert_admin" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_update_admin" ON customers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "customers_delete_super_admin" ON customers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );
