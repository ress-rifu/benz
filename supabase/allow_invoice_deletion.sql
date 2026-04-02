-- Migration: Allow Invoice Deletion
-- Run this in your Supabase SQL Editor
--
-- This removes the triggers that prevent invoice and invoice_items deletion,
-- allowing admins to delete invoices from the app.
-- The part_stock_logs FK uses ON DELETE SET NULL, so deleting an invoice
-- will just null out the invoice_id on related stock logs (preserving audit trail).

-- 1. Drop the trigger that prevents invoice deletion
DROP TRIGGER IF EXISTS prevent_invoice_delete ON invoices;

-- 2. Drop the trigger that prevents invoice_items deletion
DROP TRIGGER IF EXISTS prevent_invoice_items_delete ON invoice_items;

-- 3. Drop the trigger that prevents invoice_items updates/deletes
DROP TRIGGER IF EXISTS prevent_invoice_item_update ON invoice_items;
DROP TRIGGER IF EXISTS prevent_invoice_item_delete ON invoice_items;

-- 4. Drop the stock log UPDATE trigger (blocks ON DELETE SET NULL from updating invoice_id)
DROP TRIGGER IF EXISTS prevent_inventory_log_update ON part_stock_logs;

-- 5. Recreate the stock log trigger for DELETE only (keep logs immutable for deletes)
-- But allow updates (needed for FK SET NULL when invoice is deleted)
CREATE OR REPLACE FUNCTION prevent_stock_log_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Stock logs cannot be deleted.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS prevent_inventory_log_delete ON part_stock_logs;
CREATE TRIGGER prevent_stock_log_delete
    BEFORE DELETE ON part_stock_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_stock_log_deletion();

-- 6. Drop old functions (no longer needed)
DROP FUNCTION IF EXISTS prevent_invoice_deletion();
DROP FUNCTION IF EXISTS prevent_invoice_item_modification();
DROP FUNCTION IF EXISTS prevent_inventory_log_modification();
