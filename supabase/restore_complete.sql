-- =====================================================
-- COMPLETE RESTORATION: Auth Functions in PUBLIC schema
-- The auth schema is managed by Supabase, so we create in public
-- =====================================================

-- =====================================================
-- STEP 1: Create Auth Helper Functions in PUBLIC schema
-- =====================================================

-- Function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role FROM public.users 
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is admin or super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role() IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role() = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- =====================================================
-- STEP 2: Restore Original Users Table Policies
-- =====================================================

DROP POLICY IF EXISTS "Users can read profiles" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Super admins can read all users" ON users;
DROP POLICY IF EXISTS "Super admins can delete users" ON users;
DROP POLICY IF EXISTS "Allow self registration" ON users;

CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Super admins can read all users" ON users
  FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admins can delete users" ON users
  FOR DELETE
  USING (public.is_super_admin() AND auth.uid() != id);

-- =====================================================
-- STEP 3: Restore Invoice Policies
-- =====================================================

DROP POLICY IF EXISTS "Admins can update own invoices" ON invoices;

CREATE POLICY "Admins can update own invoices" ON invoices
  FOR UPDATE
  USING (
    public.is_super_admin() OR 
    (public.is_admin() AND created_by = auth.uid())
  );

-- =====================================================
-- STEP 4: Restore Invoice Items Policies
-- =====================================================

DROP POLICY IF EXISTS "Admins can update invoice items" ON invoice_items;

CREATE POLICY "Admins can update invoice items" ON invoice_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND (public.is_super_admin() OR invoices.created_by = auth.uid())
    )
  );

-- =====================================================
-- STEP 5: Restore Part Stock Logs Policies
-- =====================================================

DROP POLICY IF EXISTS "Admins can view part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert part stock logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can read inventory logs" ON part_stock_logs;
DROP POLICY IF EXISTS "Admins can insert inventory logs" ON part_stock_logs;

CREATE POLICY "Admins can read inventory logs" ON part_stock_logs
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can insert inventory logs" ON part_stock_logs
  FOR INSERT
  WITH CHECK (public.is_admin());

-- =====================================================
-- STEP 6: Restore Service Categories Policies
-- =====================================================

DROP POLICY IF EXISTS "service_categories_select_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_insert_super_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_update_super_admin" ON service_categories;
DROP POLICY IF EXISTS "service_categories_delete_super_admin" ON service_categories;

CREATE POLICY "service_categories_select_admin" ON service_categories
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "service_categories_insert_super_admin" ON service_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "service_categories_update_super_admin" ON service_categories
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "service_categories_delete_super_admin" ON service_categories
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- STEP 7: Restore Services Policies
-- =====================================================

DROP POLICY IF EXISTS "services_select_admin" ON services;
DROP POLICY IF EXISTS "services_insert_super_admin" ON services;
DROP POLICY IF EXISTS "services_update_super_admin" ON services;
DROP POLICY IF EXISTS "services_delete_super_admin" ON services;

CREATE POLICY "services_select_admin" ON services
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "services_insert_super_admin" ON services
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "services_update_super_admin" ON services
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "services_delete_super_admin" ON services
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- STEP 8: Restore Part Categories Policies
-- =====================================================

DROP POLICY IF EXISTS "part_categories_select_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_insert_super_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_update_super_admin" ON part_categories;
DROP POLICY IF EXISTS "part_categories_delete_super_admin" ON part_categories;

CREATE POLICY "part_categories_select_admin" ON part_categories
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "part_categories_insert_super_admin" ON part_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "part_categories_update_super_admin" ON part_categories
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "part_categories_delete_super_admin" ON part_categories
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- STEP 9: Restore Part Brands Policies
-- =====================================================

DROP POLICY IF EXISTS "part_brands_select_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_insert_super_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_update_super_admin" ON part_brands;
DROP POLICY IF EXISTS "part_brands_delete_super_admin" ON part_brands;

CREATE POLICY "part_brands_select_admin" ON part_brands
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "part_brands_insert_super_admin" ON part_brands
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "part_brands_update_super_admin" ON part_brands
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "part_brands_delete_super_admin" ON part_brands
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- STEP 10: Restore Parts Policies
-- =====================================================

DROP POLICY IF EXISTS "parts_select_admin" ON parts;
DROP POLICY IF EXISTS "parts_insert_super_admin" ON parts;
DROP POLICY IF EXISTS "parts_update_super_admin" ON parts;
DROP POLICY IF EXISTS "parts_delete_super_admin" ON parts;

CREATE POLICY "parts_select_admin" ON parts
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "parts_insert_super_admin" ON parts
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "parts_update_super_admin" ON parts
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "parts_delete_super_admin" ON parts
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- =====================================================
-- STEP 11: Restore Customers Policies
-- =====================================================

DROP POLICY IF EXISTS "customers_select_admin" ON customers;
DROP POLICY IF EXISTS "customers_insert_admin" ON customers;
DROP POLICY IF EXISTS "customers_update_admin" ON customers;
DROP POLICY IF EXISTS "customers_delete_super_admin" ON customers;

CREATE POLICY "customers_select_admin" ON customers
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "customers_insert_admin" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "customers_update_admin" ON customers
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "customers_delete_super_admin" ON customers
  FOR DELETE TO authenticated
  USING (public.is_super_admin());
