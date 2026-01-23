-- Migration: Add Invoice Status (Due/Paid) Support
-- This migration adds status functionality to invoices while maintaining data integrity

-- 1. Create invoice status enum (only if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('due', 'paid');
    END IF;
END $$;

-- 2. Add status column to invoices table with default 'paid' for existing records
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS status invoice_status NOT NULL DEFAULT 'paid';

-- 3. Create index for efficient status-based queries
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- 4. Drop the old immutability trigger if it exists
DROP TRIGGER IF EXISTS enforce_invoice_immutability ON invoices;
DROP FUNCTION IF EXISTS prevent_invoice_update();

-- 5. Create new trigger that allows ONLY status updates
CREATE OR REPLACE FUNCTION allow_status_update_only()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow status changes from 'due' to 'paid'
    IF OLD.status = 'due' AND NEW.status = 'paid' THEN
        -- Only allow status change, all other fields must remain the same
        IF (OLD.invoice_number IS DISTINCT FROM NEW.invoice_number OR
            OLD.customer_name IS DISTINCT FROM NEW.customer_name OR
            OLD.customer_email IS DISTINCT FROM NEW.customer_email OR
            OLD.customer_phone IS DISTINCT FROM NEW.customer_phone OR
            OLD.customer_address IS DISTINCT FROM NEW.customer_address OR
            OLD.vehicle_make IS DISTINCT FROM NEW.vehicle_make OR
            OLD.vehicle_model IS DISTINCT FROM NEW.vehicle_model OR
            OLD.vehicle_year IS DISTINCT FROM NEW.vehicle_year OR
            OLD.vehicle_vin IS DISTINCT FROM NEW.vehicle_vin OR
            OLD.vehicle_license_plate IS DISTINCT FROM NEW.vehicle_license_plate OR
            OLD.subtotal IS DISTINCT FROM NEW.subtotal OR
            OLD.tax_rate IS DISTINCT FROM NEW.tax_rate OR
            OLD.tax_amount IS DISTINCT FROM NEW.tax_amount OR
            OLD.discount_amount IS DISTINCT FROM NEW.discount_amount OR
            OLD.total IS DISTINCT FROM NEW.total OR
            OLD.notes IS DISTINCT FROM NEW.notes OR
            OLD.created_by IS DISTINCT FROM NEW.created_by OR
            OLD.billed_by_name IS DISTINCT FROM NEW.billed_by_name OR
            OLD.settings_snapshot IS DISTINCT FROM NEW.settings_snapshot OR
            OLD.created_at IS DISTINCT FROM NEW.created_at) THEN
            RAISE EXCEPTION 'Only status changes from due to paid are allowed on invoices.';
        END IF;
        
        -- Update timestamp
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    
    -- Prevent changing from paid to due
    IF OLD.status = 'paid' AND NEW.status = 'due' THEN
        RAISE EXCEPTION 'Cannot change invoice status from paid to due.';
    END IF;
    
    -- Prevent any other modifications
    RAISE EXCEPTION 'Invoices cannot be modified except for status changes from due to paid.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_limited_invoice_updates
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION allow_status_update_only();

-- 6. Update invoice_items trigger to remain immutable
-- (Keep invoice_items completely immutable as before)
CREATE OR REPLACE FUNCTION prevent_invoice_item_update()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Invoice items are immutable and cannot be modified.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_invoice_item_update ON invoice_items;
CREATE TRIGGER prevent_invoice_item_update
    BEFORE UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_item_update();

-- 7. Add comment for documentation
COMMENT ON COLUMN invoices.status IS 'Invoice payment status: due (unpaid) or paid';
COMMENT ON TRIGGER enforce_limited_invoice_updates ON invoices IS 'Allows only status changes from due to paid';
