-- Migration: Make Invoices Completely Immutable
-- Run this in your Supabase SQL Editor
-- 
-- This migration:
-- 1. Adds settings snapshot columns to invoices (stored at creation time)
-- 2. Adds billed_by_name column to store creator name permanently
-- 3. Adds trigger to prevent ANY modifications to invoices (except status changes)

-- ============================================
-- ADD SETTINGS SNAPSHOT COLUMNS TO INVOICES
-- ============================================

-- Add settings snapshot as JSONB (stores all settings at invoice creation time)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS settings_snapshot JSONB;

-- Add billed_by_name to permanently store the creator's name
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billed_by_name TEXT;

-- ============================================
-- TRIGGER TO MAKE INVOICES IMMUTABLE
-- (Only status can be changed: pending -> paid/cancelled)
-- ============================================

CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only allow status changes (and only valid transitions)
    IF OLD.status = 'paid' OR OLD.status = 'cancelled' THEN
        RAISE EXCEPTION 'Cannot modify a % invoice', OLD.status;
    END IF;
    
    -- Check if only status is being changed
    IF NEW.invoice_number IS DISTINCT FROM OLD.invoice_number OR
       NEW.customer_name IS DISTINCT FROM OLD.customer_name OR
       NEW.customer_email IS DISTINCT FROM OLD.customer_email OR
       NEW.customer_phone IS DISTINCT FROM OLD.customer_phone OR
       NEW.customer_address IS DISTINCT FROM OLD.customer_address OR
       NEW.vehicle_make IS DISTINCT FROM OLD.vehicle_make OR
       NEW.vehicle_model IS DISTINCT FROM OLD.vehicle_model OR
       NEW.vehicle_year IS DISTINCT FROM OLD.vehicle_year OR
       NEW.vehicle_vin IS DISTINCT FROM OLD.vehicle_vin OR
       NEW.vehicle_license_plate IS DISTINCT FROM OLD.vehicle_license_plate OR
       NEW.subtotal IS DISTINCT FROM OLD.subtotal OR
       NEW.tax_rate IS DISTINCT FROM OLD.tax_rate OR
       NEW.tax_amount IS DISTINCT FROM OLD.tax_amount OR
       NEW.discount_amount IS DISTINCT FROM OLD.discount_amount OR
       NEW.total IS DISTINCT FROM OLD.total OR
       NEW.notes IS DISTINCT FROM OLD.notes OR
       NEW.created_by IS DISTINCT FROM OLD.created_by OR
       NEW.created_at IS DISTINCT FROM OLD.created_at OR
       NEW.settings_snapshot IS DISTINCT FROM OLD.settings_snapshot OR
       NEW.billed_by_name IS DISTINCT FROM OLD.billed_by_name THEN
        RAISE EXCEPTION 'Invoices are immutable. Only status can be changed.';
    END IF;
    
    -- Only allow valid status transitions
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        IF OLD.status NOT IN ('draft', 'pending') THEN
            RAISE EXCEPTION 'Cannot change status of a % invoice', OLD.status;
        END IF;
        
        IF NEW.status NOT IN ('pending', 'paid', 'cancelled') THEN
            RAISE EXCEPTION 'Invalid status transition to %', NEW.status;
        END IF;
    END IF;
    
    -- Allow the update (only status change at this point)
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_invoice_immutability ON invoices;
CREATE TRIGGER enforce_invoice_immutability
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION enforce_invoice_immutability();

-- ============================================
-- TRIGGER TO MAKE INVOICE ITEMS IMMUTABLE
-- ============================================

CREATE OR REPLACE FUNCTION public.prevent_invoice_item_modification()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Invoice items cannot be modified. They are immutable.';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Invoice items cannot be deleted. They are immutable.';
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS prevent_invoice_item_update ON invoice_items;
CREATE TRIGGER prevent_invoice_item_update
    BEFORE UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_item_modification();

-- Note: Delete trigger already exists from protect_data_migration.sql

-- ============================================
-- SUMMARY
-- ============================================
-- 
-- INVOICES:
--   ✓ settings_snapshot - Stores all display settings at creation time
--   ✓ billed_by_name - Stores creator's name permanently
--   ✓ Only status can be changed (draft/pending -> paid/cancelled)
--   ✓ All other fields are completely immutable
--
-- INVOICE ITEMS:
--   ✓ Cannot be modified (UPDATE blocked)
--   ✓ Cannot be deleted (DELETE blocked)
--   ✓ Only created when invoice is created
--
