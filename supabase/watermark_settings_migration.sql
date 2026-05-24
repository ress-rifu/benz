-- ============================================================
-- Migration: Add Watermark Customization Settings
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Add watermark_text column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'watermark_text'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN watermark_text TEXT NOT NULL DEFAULT 'RIFLAB Software Ltd. : 01518937762';
    END IF;
END $$;

-- Add watermark_size column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'watermark_size'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN watermark_size INTEGER NOT NULL DEFAULT 4;
    END IF;
END $$;

-- Add watermark_color column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'watermark_color'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN watermark_color TEXT NOT NULL DEFAULT '#94a3b8';
    END IF;
END $$;

-- Add show_watermark column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'invoice_settings'
        AND column_name = 'show_watermark'
    ) THEN
        ALTER TABLE invoice_settings ADD COLUMN show_watermark BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;
