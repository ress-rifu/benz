-- =====================================================
-- MIGRATION: Migrate inventory_items to parts
-- This migration removes the deprecated inventory_items table
-- and renames inventory_logs to part_stock_logs
-- =====================================================

-- Step 1: Rename inventory_logs to part_stock_logs
-- First, rename the column from inventory_item_id to part_id
ALTER TABLE public.inventory_logs 
RENAME COLUMN inventory_item_id TO part_id;

-- Rename the table
ALTER TABLE public.inventory_logs RENAME TO part_stock_logs;

-- Update the foreign key constraint to point to parts table instead of inventory_items
ALTER TABLE public.part_stock_logs
DROP CONSTRAINT IF EXISTS inventory_logs_inventory_item_id_fkey;

ALTER TABLE public.part_stock_logs
ADD CONSTRAINT part_stock_logs_part_id_fkey
FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE RESTRICT;

-- Rename other constraints
ALTER TABLE public.part_stock_logs
DROP CONSTRAINT IF EXISTS inventory_logs_user_id_fkey;

ALTER TABLE public.part_stock_logs
ADD CONSTRAINT part_stock_logs_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE public.part_stock_logs
DROP CONSTRAINT IF EXISTS inventory_logs_invoice_id_fkey;

ALTER TABLE public.part_stock_logs
ADD CONSTRAINT part_stock_logs_invoice_id_fkey
FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;

-- Step 2: Update invoice_items table
-- Rename inventory_item_id to part_id
ALTER TABLE public.invoice_items
RENAME COLUMN inventory_item_id TO part_id;

-- Drop old foreign key constraint
ALTER TABLE public.invoice_items
DROP CONSTRAINT IF EXISTS invoice_items_inventory_item_id_fkey;

-- Add new foreign key constraint to parts table
ALTER TABLE public.invoice_items
ADD CONSTRAINT invoice_items_part_id_fkey
FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE SET NULL;

-- Step 3: Rename the inventory_action enum to part_stock_action (optional)
-- Note: Renaming enums in PostgreSQL is tricky, so we'll just leave it as is
-- The code will still work with the existing enum name

-- Step 4: Drop the deprecated inventory_items table
-- First check if there are any remaining foreign key references
-- If there are, this will fail and you'll need to handle those manually
DROP TABLE IF EXISTS public.inventory_items CASCADE;

-- Step 5: Update RLS policies for part_stock_logs
DROP POLICY IF EXISTS "Admins can view all inventory logs" ON public.part_stock_logs;
DROP POLICY IF EXISTS "Admins can create inventory logs" ON public.part_stock_logs;

CREATE POLICY "Admins can view all part stock logs" ON public.part_stock_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create part stock logs" ON public.part_stock_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- Step 6: Create index for part_stock_logs
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_part_id ON public.part_stock_logs(part_id);
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_user_id ON public.part_stock_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_invoice_id ON public.part_stock_logs(invoice_id);

-- Step 7: Create index for invoice_items part_id
CREATE INDEX IF NOT EXISTS idx_invoice_items_part_id ON public.invoice_items(part_id);
