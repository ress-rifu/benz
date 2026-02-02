-- =====================================================
-- MIGRATION: Drop Unused Indexes
-- Based on Supabase Performance Advisor recommendations
-- These indexes have never been used and can be recreated if needed
-- =====================================================

-- Users table
DROP INDEX IF EXISTS idx_users_role;

-- Part stock logs table
DROP INDEX IF EXISTS idx_inventory_logs_created_at;
DROP INDEX IF EXISTS idx_part_stock_logs_part_id;
DROP INDEX IF EXISTS idx_part_stock_logs_user_id;
DROP INDEX IF EXISTS idx_part_stock_logs_invoice_id;

-- Invoices table
DROP INDEX IF EXISTS idx_invoices_number;
DROP INDEX IF EXISTS idx_invoices_customer;
DROP INDEX IF EXISTS idx_invoices_status;

-- Services table
DROP INDEX IF EXISTS idx_services_category;
DROP INDEX IF EXISTS idx_services_active;
DROP INDEX IF EXISTS idx_services_price;

-- Service categories table
DROP INDEX IF EXISTS idx_service_categories_active;

-- Part categories table
DROP INDEX IF EXISTS idx_part_categories_active;

-- Part brands table
DROP INDEX IF EXISTS idx_part_brands_active;
DROP INDEX IF EXISTS idx_part_brands_category_id;

-- Parts table
DROP INDEX IF EXISTS idx_parts_category;
DROP INDEX IF EXISTS idx_parts_brand;
DROP INDEX IF EXISTS idx_parts_part_number;
DROP INDEX IF EXISTS idx_parts_active;

-- Customers table (low cardinality - safe to drop)
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_customers_phone;
DROP INDEX IF EXISTS idx_customers_active;

-- Invoice items table
DROP INDEX IF EXISTS idx_invoice_items_part_id;

-- =====================================================
-- PART 2: Recreate indexes needed for foreign keys
-- These are required for efficient FK constraint checks
-- =====================================================

-- invoice_items foreign key index
CREATE INDEX IF NOT EXISTS idx_invoice_items_part_id ON invoice_items(part_id);

-- part_brands foreign key index  
CREATE INDEX IF NOT EXISTS idx_part_brands_category_id ON part_brands(category_id);

-- part_stock_logs foreign key indexes
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_invoice_id ON part_stock_logs(invoice_id);
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_part_id ON part_stock_logs(part_id);
CREATE INDEX IF NOT EXISTS idx_part_stock_logs_user_id ON part_stock_logs(user_id);

-- parts foreign key indexes
CREATE INDEX IF NOT EXISTS idx_parts_brand_id ON parts(brand_id);
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON parts(category_id);

-- services foreign key index
CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
