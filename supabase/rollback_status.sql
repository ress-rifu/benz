-- Rollback: Remove status column and restore full immutability
-- This reverts the remove_status_default.sql migration

-- 1. Drop the status-related triggers
DROP TRIGGER IF EXISTS enforce_limited_invoice_updates ON invoices;
DROP FUNCTION IF EXISTS allow_status_update_only() CASCADE;
DROP FUNCTION IF EXISTS set_invoice_status(UUID, invoice_status) CASCADE;

-- 2. Drop the status column
ALTER TABLE invoices DROP COLUMN IF EXISTS status;

-- 3. Drop the enum type
DROP TYPE IF EXISTS invoice_status;

-- 4. Drop the status index
DROP INDEX IF EXISTS idx_invoices_status;

-- 5. Restore full immutability trigger (from invoice_immutability_migration.sql)
CREATE OR REPLACE FUNCTION public.enforce_invoice_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Invoices are completely immutable and cannot be modified.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS enforce_invoice_immutability ON invoices;
CREATE TRIGGER enforce_invoice_immutability
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION enforce_invoice_immutability();

-- 6. Restore invoice items immutability
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
