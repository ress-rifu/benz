-- ============================================================
-- BENZ AUTOMOBILE — COMPLETE DATABASE BUILD FROM SCRATCH
-- ============================================================
-- This script DROPS everything and rebuilds the entire database.
-- Run this in the Supabase SQL Editor.
-- WARNING: This will DELETE ALL DATA.
-- ============================================================

-- ========================
-- 1. CLEAN SLATE
-- ========================

-- Drop all triggers first (before dropping functions/tables)
DO $$ DECLARE r RECORD;
BEGIN
    FOR r IN (
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers
        WHERE trigger_schema = 'public'
    ) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I CASCADE', r.trigger_name, r.event_object_table);
    END LOOP;
END $$;

-- Drop all tables in dependency order
DROP TABLE IF EXISTS part_stock_logs CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS invoice_settings CASCADE;
DROP TABLE IF EXISTS parts CASCADE;
DROP TABLE IF EXISTS part_brands CASCADE;
DROP TABLE IF EXISTS part_categories CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop old renamed table if it lingers
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS inventory_logs CASCADE;

-- Drop all custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS inventory_action CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS invoice_item_type CASCADE;

-- Drop all custom functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS enforce_invoice_immutability() CASCADE;
DROP FUNCTION IF EXISTS allow_status_update_only() CASCADE;
DROP FUNCTION IF EXISTS prevent_invoice_item_modification() CASCADE;
DROP FUNCTION IF EXISTS prevent_invoice_item_update() CASCADE;
DROP FUNCTION IF EXISTS prevent_invoice_update() CASCADE;
DROP FUNCTION IF EXISTS prevent_invoice_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_parts_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_services_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_service_category_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_part_category_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_part_brand_deletion() CASCADE;
DROP FUNCTION IF EXISTS prevent_inventory_log_modification() CASCADE;
DROP FUNCTION IF EXISTS set_invoice_status(UUID, invoice_status) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;

-- ========================
-- 2. EXTENSIONS
-- ========================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- 3. ENUMS
-- ========================

CREATE TYPE user_role AS ENUM ('super_admin', 'admin');
CREATE TYPE inventory_action AS ENUM ('add', 'remove', 'adjust', 'invoice_deduct');
CREATE TYPE invoice_status AS ENUM ('due', 'paid');
CREATE TYPE invoice_item_type AS ENUM ('part', 'service');

-- ========================
-- 4. UTILITY FUNCTIONS
-- ========================
-- NOTE: Auth helper functions (is_admin, is_super_admin) are created in
-- section 6b, AFTER the users table exists, because SQL functions are
-- validated at creation time.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- ========================
-- 6. TABLES
-- ========================

-- 6.1 Users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- 6b. AUTH HELPER FUNCTIONS
-- (must come after users table)
-- ========================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role IN ('admin', 'super_admin')
    );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid()
        AND role = 'super_admin'
    );
$$;

-- 6.2 Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.3 Service Categories
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_bn TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.4 Services
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    name_bn TEXT,
    description TEXT,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    duration_minutes INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.5 Part Categories
CREATE TABLE part_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_bn TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.6 Part Brands
CREATE TABLE part_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    category_id UUID REFERENCES part_categories(id) ON DELETE SET NULL,
    country_of_origin TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.7 Parts
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES part_categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES part_brands(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    sku TEXT NOT NULL UNIQUE,
    part_number TEXT,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    cost_price DECIMAL(12,2) NOT NULL CHECK (cost_price >= 0),
    selling_price DECIMAL(12,2) NOT NULL CHECK (selling_price >= 0),
    min_stock_level INTEGER DEFAULT 5,
    description TEXT,
    compatible_vehicles TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.8 Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    customer_address TEXT,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER,
    vehicle_vin TEXT,
    vehicle_license_plate TEXT,
    vehicle_mileage INTEGER,
    driver_name TEXT,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    notes TEXT,
    status invoice_status NOT NULL DEFAULT 'paid',
    created_by UUID NOT NULL REFERENCES users(id),
    billed_by_name TEXT,
    settings_snapshot JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.9 Invoice Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    type invoice_item_type NOT NULL,
    part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total DECIMAL(10,2) NOT NULL,
    part_model TEXT,
    part_serial TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.10 Invoice Settings
CREATE TABLE invoice_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    logo_url TEXT,
    header_text TEXT,
    footer_text TEXT,
    primary_color TEXT NOT NULL DEFAULT '#1f2937',
    secondary_color TEXT NOT NULL DEFAULT '#4b5563',
    show_logo BOOLEAN NOT NULL DEFAULT true,
    show_header BOOLEAN NOT NULL DEFAULT true,
    show_footer BOOLEAN NOT NULL DEFAULT true,
    show_vehicle_vin BOOLEAN NOT NULL DEFAULT true,
    show_vehicle_license BOOLEAN NOT NULL DEFAULT true,
    show_customer_email BOOLEAN NOT NULL DEFAULT true,
    show_customer_phone BOOLEAN NOT NULL DEFAULT true,
    show_customer_address BOOLEAN NOT NULL DEFAULT true,
    margin_top INTEGER NOT NULL DEFAULT 10,
    margin_right INTEGER NOT NULL DEFAULT 10,
    margin_bottom INTEGER NOT NULL DEFAULT 10,
    margin_left INTEGER NOT NULL DEFAULT 10,
    header_image_url TEXT,
    show_header_image BOOLEAN NOT NULL DEFAULT true,
    footer_image_url TEXT,
    show_footer_image BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6.11 Part Stock Logs
CREATE TABLE part_stock_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    part_id UUID NOT NULL REFERENCES parts(id) ON DELETE RESTRICT,
    action inventory_action NOT NULL,
    quantity_change INTEGER NOT NULL,
    previous_quantity INTEGER NOT NULL,
    new_quantity INTEGER NOT NULL,
    reason TEXT,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========================
-- 7. INDEXES
-- ========================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_service_categories_name ON service_categories(name);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_part_categories_name ON part_categories(name);
CREATE INDEX idx_part_brands_name ON part_brands(name);
CREATE INDEX idx_part_brands_category_id ON part_brands(category_id);
CREATE INDEX idx_parts_sku ON parts(sku);
CREATE INDEX idx_parts_name ON parts(name);
CREATE INDEX idx_parts_quantity ON parts(quantity);
CREATE INDEX idx_parts_brand_id ON parts(brand_id);
CREATE INDEX idx_parts_category_id ON parts(category_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_items_part_id ON invoice_items(part_id);
CREATE INDEX idx_part_stock_logs_part_id ON part_stock_logs(part_id);
CREATE INDEX idx_part_stock_logs_user_id ON part_stock_logs(user_id);
CREATE INDEX idx_part_stock_logs_invoice_id ON part_stock_logs(invoice_id);

-- ========================
-- 8. UPDATED_AT TRIGGERS
-- ========================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_categories_updated_at BEFORE UPDATE ON service_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_part_categories_updated_at BEFORE UPDATE ON part_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_part_brands_updated_at BEFORE UPDATE ON part_brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_parts_updated_at BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoice_settings_updated_at BEFORE UPDATE ON invoice_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================
-- 9. DATA PROTECTION TRIGGERS
-- ========================

-- 9.1 Invoice status updates only (allows paid <-> due, blocks all other changes)
CREATE OR REPLACE FUNCTION allow_status_update_only()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
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
            OLD.vehicle_mileage IS DISTINCT FROM NEW.vehicle_mileage OR
            OLD.driver_name IS DISTINCT FROM NEW.driver_name OR
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
            RAISE EXCEPTION 'Only status changes are allowed on invoices.';
        END IF;
        NEW.updated_at = NOW();
        RETURN NEW;
    END IF;
    RAISE EXCEPTION 'Invoices cannot be modified except for status changes.';
END;
$$;

CREATE TRIGGER enforce_limited_invoice_updates
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION allow_status_update_only();

-- 9.2 Invoice items are immutable
CREATE OR REPLACE FUNCTION prevent_invoice_item_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        RAISE EXCEPTION 'Invoice items cannot be modified.';
    ELSIF TG_OP = 'DELETE' THEN
        RAISE EXCEPTION 'Invoice items cannot be deleted.';
    END IF;
    RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_invoice_item_update
    BEFORE UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_item_modification();

-- 9.3 Prevent invoice deletion
CREATE OR REPLACE FUNCTION prevent_invoice_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Invoices cannot be deleted.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_invoice_delete
    BEFORE DELETE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_deletion();

CREATE TRIGGER prevent_invoice_items_delete
    BEFORE DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION prevent_invoice_deletion();

-- 9.4 Prevent parts/services deletion (soft delete via is_active)
CREATE OR REPLACE FUNCTION prevent_parts_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Parts cannot be deleted. Set is_active to false instead.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_parts_delete
    BEFORE DELETE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION prevent_parts_deletion();

CREATE OR REPLACE FUNCTION prevent_services_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Services cannot be deleted. Set is_active to false instead.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_services_delete
    BEFORE DELETE ON services
    FOR EACH ROW
    EXECUTE FUNCTION prevent_services_deletion();

-- 9.5 Prevent category/brand deletion if they have children
CREATE OR REPLACE FUNCTION prevent_service_category_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM services WHERE category_id = OLD.id) THEN
        RAISE EXCEPTION 'Cannot delete service category that has services.';
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER protect_service_category_delete
    BEFORE DELETE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_service_category_deletion();

CREATE OR REPLACE FUNCTION prevent_part_category_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM parts WHERE category_id = OLD.id) THEN
        RAISE EXCEPTION 'Cannot delete part category that has parts.';
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER protect_part_category_delete
    BEFORE DELETE ON part_categories
    FOR EACH ROW
    EXECUTE FUNCTION prevent_part_category_deletion();

CREATE OR REPLACE FUNCTION prevent_part_brand_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM parts WHERE brand_id = OLD.id) THEN
        RAISE EXCEPTION 'Cannot delete part brand that has parts.';
    END IF;
    RETURN OLD;
END;
$$;

CREATE TRIGGER protect_part_brand_delete
    BEFORE DELETE ON part_brands
    FOR EACH ROW
    EXECUTE FUNCTION prevent_part_brand_deletion();

-- 9.6 Part stock logs are immutable
CREATE OR REPLACE FUNCTION prevent_inventory_log_modification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE EXCEPTION 'Stock logs cannot be modified or deleted.';
    RETURN NULL;
END;
$$;

CREATE TRIGGER prevent_inventory_log_update
    BEFORE UPDATE ON part_stock_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_inventory_log_modification();

CREATE TRIGGER prevent_inventory_log_delete
    BEFORE DELETE ON part_stock_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_inventory_log_modification();

-- ========================
-- 10. ROW LEVEL SECURITY
-- ========================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_stock_logs ENABLE ROW LEVEL SECURITY;

-- 10.1 Users
CREATE POLICY "Users can read own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Super admins can read all users"
    ON users FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
    );

CREATE POLICY "Allow self registration"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can update any user"
    ON users FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
    );

CREATE POLICY "Super admins can delete users"
    ON users FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
        AND auth.uid() != id
    );

-- 10.2 Customers
CREATE POLICY "customers_select_admin" ON customers FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "customers_insert_admin" ON customers FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "customers_update_admin" ON customers FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "customers_delete_super_admin" ON customers FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.3 Service Categories
CREATE POLICY "service_categories_select_admin" ON service_categories FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "service_categories_insert_super_admin" ON service_categories FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "service_categories_update_super_admin" ON service_categories FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "service_categories_delete_super_admin" ON service_categories FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.4 Services
CREATE POLICY "services_select_admin" ON services FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "services_insert_super_admin" ON services FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "services_update_super_admin" ON services FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "services_delete_super_admin" ON services FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.5 Part Categories
CREATE POLICY "part_categories_select_admin" ON part_categories FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "part_categories_insert_super_admin" ON part_categories FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "part_categories_update_super_admin" ON part_categories FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "part_categories_delete_super_admin" ON part_categories FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.6 Part Brands
CREATE POLICY "part_brands_select_admin" ON part_brands FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "part_brands_insert_super_admin" ON part_brands FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "part_brands_update_super_admin" ON part_brands FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "part_brands_delete_super_admin" ON part_brands FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.7 Parts
CREATE POLICY "parts_select_admin" ON parts FOR SELECT
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('admin', 'super_admin')));
CREATE POLICY "parts_insert_super_admin" ON parts FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "parts_update_super_admin" ON parts FOR UPDATE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));
CREATE POLICY "parts_delete_super_admin" ON parts FOR DELETE
    USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'super_admin'));

-- 10.8 Invoices
CREATE POLICY "Admins can read invoices" ON invoices FOR SELECT
    USING (public.is_admin());
CREATE POLICY "Admins can create invoices" ON invoices FOR INSERT
    WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update invoices" ON invoices FOR UPDATE
    USING (
        public.is_super_admin() OR
        (public.is_admin() AND created_by = auth.uid())
    );
CREATE POLICY "Super admins can delete invoices" ON invoices FOR DELETE
    USING (public.is_super_admin());

-- 10.9 Invoice Items
CREATE POLICY "Admins can read invoice items" ON invoice_items FOR SELECT
    USING (public.is_admin());
CREATE POLICY "Admins can insert invoice items" ON invoice_items FOR INSERT
    WITH CHECK (public.is_admin());
CREATE POLICY "Admins can update invoice items" ON invoice_items FOR UPDATE
    USING (public.is_super_admin());
CREATE POLICY "Super admins can delete invoice items" ON invoice_items FOR DELETE
    USING (public.is_super_admin());

-- 10.10 Invoice Settings
CREATE POLICY "Admins can read invoice settings" ON invoice_settings FOR SELECT
    USING (public.is_admin());
CREATE POLICY "Super admins can manage invoice settings" ON invoice_settings FOR ALL
    USING (public.is_super_admin());

-- 10.11 Part Stock Logs
CREATE POLICY "Admins can view part stock logs" ON part_stock_logs FOR SELECT
    USING (public.is_admin());
CREATE POLICY "Admins can insert part stock logs" ON part_stock_logs FOR INSERT
    WITH CHECK (public.is_admin());

-- ========================
-- 11. STORAGE
-- ========================

-- Create bucket (will fail silently if it exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoice-assets',
    'invoice-assets',
    true,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Storage policies (drop existing first)
DROP POLICY IF EXISTS "Admins can upload invoice assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view invoice assets" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can update invoice assets" ON storage.objects;
DROP POLICY IF EXISTS "Super admins can delete invoice assets" ON storage.objects;

CREATE POLICY "Admins can upload invoice assets" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'invoice-assets' AND public.is_admin());
CREATE POLICY "Anyone can view invoice assets" ON storage.objects FOR SELECT
    USING (bucket_id = 'invoice-assets');
CREATE POLICY "Super admins can update invoice assets" ON storage.objects FOR UPDATE
    USING (bucket_id = 'invoice-assets' AND public.is_super_admin());
CREATE POLICY "Super admins can delete invoice assets" ON storage.objects FOR DELETE
    USING (bucket_id = 'invoice-assets' AND public.is_super_admin());

-- ========================
-- 12. SEED: Default invoice settings row
-- ========================

INSERT INTO invoice_settings (
    header_text,
    footer_text,
    primary_color,
    secondary_color
) VALUES (
    'Thank you for choosing Benz Automobile for your vehicle service needs.',
    'Payment is due within 30 days. Thank you for your business!',
    '#1f2937',
    '#4b5563'
);

-- ========================
-- DONE
-- ========================
-- After running this, create your first admin user via Supabase Auth,
-- then insert a matching row into the users table:
--
--   INSERT INTO users (id, email, username, name, role)
--   VALUES ('<auth-user-uuid>', 'admin@example.com', 'admin', 'Admin', 'super_admin');
--
