-- ============================================================
-- Add VAT REG NO. (BIN) to invoice_settings Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add vat_reg_no column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'vat_reg_no'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN vat_reg_no TEXT NULL;
    END IF;
END $$;

-- Add show_vat_reg_no column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'show_vat_reg_no'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN show_vat_reg_no BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;
