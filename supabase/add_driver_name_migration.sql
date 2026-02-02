-- Add driver_name column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS driver_name TEXT;
