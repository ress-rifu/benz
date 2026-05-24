-- Migration: Add advance_amount column to invoices table
-- This enables tracking of advance payments made by customers.
-- Due amount = total - advance_amount

-- Add the column with a default of 0 (all existing invoices will have 0 advance)
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS advance_amount NUMERIC DEFAULT 0 NOT NULL;

-- Ensure advance_amount is non-negative and does not exceed total
ALTER TABLE invoices
ADD CONSTRAINT invoices_advance_amount_check
CHECK (advance_amount >= 0);
