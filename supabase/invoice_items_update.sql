-- Migration: Add model and serial number fields to invoice_items for parts
-- Run this in your Supabase SQL Editor

-- Add part_model and part_serial columns to invoice_items
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS part_model TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS part_serial TEXT;

-- These fields will only be populated for items of type 'part'
-- Services will have these as NULL
