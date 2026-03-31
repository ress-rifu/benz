-- ============================================================
-- Add font_size to invoice_settings Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add font_size column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'font_size'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN font_size TEXT NOT NULL DEFAULT 'text-sm';
    END IF;
END $$;
