-- Migration: Protect Invoices, Parts, and Services from Deletion
-- Run this in your Supabase SQL Editor
-- 
-- This migration makes invoices, parts, and services indestructible by:
-- 1. Adding database triggers to prevent hard deletion
-- 2. Using soft delete (is_active = false) instead
-- 3. Preventing deletion of categories that have associated records

-- ============================================
-- PROTECT INVOICES FROM DELETION
-- ============================================

-- Create trigger function to prevent invoice deletion
CREATE OR REPLACE FUNCTION public.prevent_invoice_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Invoices cannot be deleted. Use status update to cancel instead.';
    RETURN NULL;
END;
$$;

-- Apply trigger to invoices table
DROP TRIGGER IF EXISTS prevent_invoice_delete ON invoices;
CREATE TRIGGER prevent_invoice_delete
    BEFORE DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_deletion();

-- Also protect invoice items from direct deletion
DROP TRIGGER IF EXISTS prevent_invoice_items_delete ON invoice_items;
CREATE TRIGGER prevent_invoice_items_delete
    BEFORE DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_deletion();

-- ============================================
-- PROTECT PARTS FROM DELETION
-- ============================================

-- Create trigger function to prevent parts deletion (must use soft delete)
CREATE OR REPLACE FUNCTION public.prevent_parts_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Parts cannot be deleted. Set is_active = false to deactivate instead.';
    RETURN NULL;
END;
$$;

-- Apply trigger to parts table
DROP TRIGGER IF EXISTS prevent_parts_delete ON parts;
CREATE TRIGGER prevent_parts_delete
    BEFORE DELETE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION prevent_parts_deletion();

-- ============================================
-- PROTECT SERVICES FROM DELETION
-- ============================================

-- Create trigger function to prevent services deletion (must use soft delete)
CREATE OR REPLACE FUNCTION public.prevent_services_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Services cannot be deleted. Set is_active = false to deactivate instead.';
    RETURN NULL;
END;
$$;

-- Apply trigger to services table
DROP TRIGGER IF EXISTS prevent_services_delete ON services;
CREATE TRIGGER prevent_services_delete
    BEFORE DELETE ON services
    FOR EACH ROW
    EXECUTE FUNCTION prevent_services_deletion();

-- ============================================
-- PROTECT CATEGORIES FROM DELETION (if they have associated items)
-- ============================================

-- Protect service categories
CREATE OR REPLACE FUNCTION public.prevent_service_category_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    service_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO service_count FROM public.services WHERE category_id = OLD.id;
    
    IF service_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete category with % associated services. Deactivate them first.', service_count;
    END IF;
    
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_service_category_delete ON service_categories;
CREATE TRIGGER protect_service_category_delete
    BEFORE DELETE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_service_category_deletion();

-- Protect part categories
CREATE OR REPLACE FUNCTION public.prevent_part_category_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    part_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO part_count FROM public.parts WHERE category_id = OLD.id;
    
    IF part_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete category with % associated parts. Deactivate them first.', part_count;
    END IF;
    
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_part_category_delete ON part_categories;
CREATE TRIGGER protect_part_category_delete
    BEFORE DELETE ON part_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_part_category_deletion();

-- ============================================
-- PROTECT PART BRANDS FROM DELETION (if they have associated parts)
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_part_brand_deletion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    part_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO part_count FROM public.parts WHERE brand_id = OLD.id;
    
    IF part_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete brand with % associated parts. Deactivate them first.', part_count;
    END IF;
    
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS protect_part_brand_delete ON part_brands;
CREATE TRIGGER protect_part_brand_delete
    BEFORE DELETE ON part_brands
    FOR EACH ROW
    EXECUTE FUNCTION prevent_part_brand_deletion();

-- ============================================
-- PROTECT INVENTORY LOGS (immutable audit trail)
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_inventory_log_modification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Inventory logs cannot be deleted. They are immutable audit records.';
    ELSIF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Inventory logs cannot be modified. They are immutable audit records.';
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS prevent_inventory_log_delete ON inventory_logs;
CREATE TRIGGER prevent_inventory_log_delete
    BEFORE DELETE ON inventory_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_inventory_log_modification();

DROP TRIGGER IF EXISTS prevent_inventory_log_update ON inventory_logs;
CREATE TRIGGER prevent_inventory_log_update
    BEFORE UPDATE ON inventory_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_inventory_log_modification();

-- ============================================
-- REMOVE CASCADE DELETES (change to RESTRICT)
-- ============================================

-- Update foreign key on inventory_logs.invoice_id to SET NULL instead of CASCADE
-- (Already SET NULL in original schema, just documenting here)

-- Update invoice_items foreign key to RESTRICT (prevent invoice deletion via items)
-- Note: This is handled by the trigger above, so we don't need to modify FK

-- ============================================
-- SUMMARY OF PROTECTIONS
-- ============================================
-- 
-- INVOICES:
--   ✓ Cannot be deleted (trigger prevents)
--   ✓ Invoice items cannot be deleted
--   → Use status = 'cancelled' to cancel invoices
--
-- PARTS:
--   ✓ Cannot be deleted (trigger prevents)
--   → Use is_active = false to deactivate
--
-- SERVICES:
--   ✓ Cannot be deleted (trigger prevents)
--   → Use is_active = false to deactivate
--
-- CATEGORIES:
--   ✓ Cannot be deleted if they have associated items
--   → Deactivate all items first, then delete category
--
-- INVENTORY LOGS:
--   ✓ Cannot be deleted or modified (immutable audit trail)
--
