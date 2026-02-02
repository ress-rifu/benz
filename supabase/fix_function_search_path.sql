-- Migration: Fix Function Search Path Security
-- This migration fixes the search_path security warning for database functions

-- 1. Fix allow_status_update_only function with secure search_path
CREATE OR REPLACE FUNCTION allow_status_update_only()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- 2. Fix prevent_invoice_item_update function with secure search_path
CREATE OR REPLACE FUNCTION prevent_invoice_item_update()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Invoice items are immutable and cannot be modified.';
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION allow_status_update_only IS 'Trigger function to allow only status changes from due to paid on invoices';
COMMENT ON FUNCTION prevent_invoice_item_update IS 'Trigger function to prevent any modifications to invoice items';
