-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Super admins can read all users
CREATE POLICY "Super admins can read all users"
    ON users FOR SELECT
    USING (auth.is_super_admin());

-- Super admins can update any user
CREATE POLICY "Super admins can update any user"
    ON users FOR UPDATE
    USING (auth.is_super_admin());

-- Super admins can delete users (except themselves)
CREATE POLICY "Super admins can delete users"
    ON users FOR DELETE
    USING (auth.is_super_admin() AND auth.uid() != id);

-- Allow insert during registration (service role handles this)
CREATE POLICY "Service role can insert users"
    ON users FOR INSERT
    WITH CHECK (true);

-- =============================================
-- INVENTORY ITEMS POLICIES
-- =============================================

-- All admins can read inventory
CREATE POLICY "Admins can read inventory"
    ON inventory_items FOR SELECT
    USING (auth.is_admin());

-- All admins can insert inventory
CREATE POLICY "Admins can insert inventory"
    ON inventory_items FOR INSERT
    WITH CHECK (auth.is_admin());

-- All admins can update inventory
CREATE POLICY "Admins can update inventory"
    ON inventory_items FOR UPDATE
    USING (auth.is_admin());

-- Only super admins can delete inventory
CREATE POLICY "Super admins can delete inventory"
    ON inventory_items FOR DELETE
    USING (auth.is_super_admin());

-- =============================================
-- INVENTORY LOGS POLICIES (Immutable - no update/delete)
-- =============================================

-- All admins can read logs
CREATE POLICY "Admins can read inventory logs"
    ON inventory_logs FOR SELECT
    USING (auth.is_admin());

-- All admins can insert logs
CREATE POLICY "Admins can insert inventory logs"
    ON inventory_logs FOR INSERT
    WITH CHECK (auth.is_admin());

-- =============================================
-- INVOICES POLICIES
-- =============================================

-- All admins can read invoices
CREATE POLICY "Admins can read invoices"
    ON invoices FOR SELECT
    USING (auth.is_admin());

-- All admins can create invoices
CREATE POLICY "Admins can create invoices"
    ON invoices FOR INSERT
    WITH CHECK (auth.is_admin());

-- All admins can update their own invoices, super admins can update any
CREATE POLICY "Admins can update own invoices"
    ON invoices FOR UPDATE
    USING (
        auth.is_super_admin() OR 
        (auth.is_admin() AND created_by = auth.uid())
    );

-- Only super admins can delete invoices
CREATE POLICY "Super admins can delete invoices"
    ON invoices FOR DELETE
    USING (auth.is_super_admin());

-- =============================================
-- INVOICE ITEMS POLICIES
-- =============================================

-- All admins can read invoice items
CREATE POLICY "Admins can read invoice items"
    ON invoice_items FOR SELECT
    USING (auth.is_admin());

-- All admins can insert invoice items
CREATE POLICY "Admins can insert invoice items"
    ON invoice_items FOR INSERT
    WITH CHECK (auth.is_admin());

-- All admins can update invoice items for their invoices
CREATE POLICY "Admins can update invoice items"
    ON invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = invoice_items.invoice_id 
            AND (auth.is_super_admin() OR invoices.created_by = auth.uid())
        )
    );

-- Only super admins can delete invoice items
CREATE POLICY "Super admins can delete invoice items"
    ON invoice_items FOR DELETE
    USING (auth.is_super_admin());

-- =============================================
-- INVOICE SETTINGS POLICIES
-- =============================================

-- All admins can read settings
CREATE POLICY "Admins can read invoice settings"
    ON invoice_settings FOR SELECT
    USING (auth.is_admin());

-- Only super admins can update settings
CREATE POLICY "Super admins can update invoice settings"
    ON invoice_settings FOR UPDATE
    USING (auth.is_super_admin());

-- =============================================
-- STORAGE POLICIES (for logo uploads)
-- =============================================

-- Create storage bucket for invoice assets
-- Run this in the Supabase Dashboard SQL Editor or via CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('invoice-assets', 'invoice-assets', true);

-- Storage policies (run in Supabase Dashboard):
/*
CREATE POLICY "Admins can upload invoice assets"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'invoice-assets' 
    AND auth.is_admin()
);

CREATE POLICY "Anyone can view invoice assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'invoice-assets');

CREATE POLICY "Super admins can delete invoice assets"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'invoice-assets' 
    AND auth.is_super_admin()
);
*/

