-- Migration: Make Invoices Completely Immutable
-- Run this in your Supabase SQL Editor
-- 
-- This migration:
-- 1. Adds settings snapshot columns to invoices (stored at creation time)
-- 2. Adds billed_by_name column to store creator name permanently
-- 3. Removes status column (invoices are created when paid)
-- 4. Adds trigger to prevent ANY modifications to invoices

-- ============================================
-- ADD SETTINGS SNAPSHOT COLUMNS TO INVOICES
-- ============================================

-- Add settings snapshot as JSONB (stores all settings at invoice creation time)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS settings_snapshot JSONB;

-- Add billed_by_name to permanently store the creator's name
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS billed_by_name TEXT;

-- ============================================
-- REMOVE STATUS COLUMN (invoices are always paid)
-- ============================================

-- Drop the status column if it exists (invoices are only created when payment is received)
ALTER TABLE invoices DROP COLUMN IF EXISTS status;

-- Drop the invoice_status enum type if it exists
DROP TYPE IF EXISTS invoice_status;

-- ============================================
-- TRIGGER TO MAKE INVOICES COMPLETELY IMMUTABLE
-- (No changes allowed at all)
-- ============================================

CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Invoices are completely immutable - no updates allowed
    RAISE EXCEPTION 'Invoices are completely immutable and cannot be modified.';
    RETURN NULL;
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
--   ✓ No status column - invoices are created when payment is received
--   ✓ Completely immutable - no updates allowed
--   ✓ Cannot be deleted
--
-- INVOICE ITEMS:
--   ✓ Cannot be modified (UPDATE blocked)
--   ✓ Cannot be deleted (DELETE blocked)
--   ✓ Only created when invoice is created
--
