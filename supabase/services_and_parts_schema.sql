-- Services & Parts Management Schema for Bangladesh Automotive Market
-- Run this migration in your Supabase SQL Editor
--
-- PREREQUISITE: The main schema.sql must be run first to create the auth helper functions
-- (auth.user_role, auth.is_admin, auth.is_super_admin)

-- ============================================
-- SERVICE CATEGORIES
-- ============================================
CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_bn TEXT, -- Bengali name
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_categories_name ON service_categories(name);
CREATE INDEX idx_service_categories_active ON service_categories(is_active);

-- Pre-populate service categories for Bangladesh market
INSERT INTO service_categories (name, name_bn, description) VALUES
    ('Engine Repair', 'ইঞ্জিন মেরামত', 'Complete engine diagnostics and repair services'),
    ('AC Service', 'এসি সার্ভিস', 'Air conditioning maintenance and repair'),
    ('Oil Change', 'তেল পরিবর্তন', 'Engine oil and filter replacement'),
    ('Brake Service', 'ব্রেক সার্ভিস', 'Brake inspection, repair and replacement'),
    ('Tire Service', 'টায়ার সার্ভিস', 'Tire rotation, balancing and replacement'),
    ('Electrical', 'ইলেকট্রিক্যাল', 'Electrical system diagnostics and repair'),
    ('Body Work', 'বডি ওয়ার্ক', 'Dent repair, painting and body restoration'),
    ('General Service', 'সাধারণ সার্ভিস', 'Regular maintenance and inspection');

-- ============================================
-- SERVICES
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    name_bn TEXT, -- Bengali name
    description TEXT,
    price DECIMAL(12, 2) NOT NULL CHECK (price >= 0), -- BDT
    duration_minutes INTEGER, -- Estimated service time
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_price ON services(price);

-- ============================================
-- PART CATEGORIES
-- ============================================
CREATE TABLE part_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_bn TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_part_categories_name ON part_categories(name);
CREATE INDEX idx_part_categories_active ON part_categories(is_active);

-- Pre-populate part categories
INSERT INTO part_categories (name, name_bn, description) VALUES
    ('Engine Parts', 'ইঞ্জিন যন্ত্রাংশ', 'Engine components and assemblies'),
    ('Filters', 'ফিল্টার', 'Oil, air, fuel and cabin filters'),
    ('Brake Parts', 'ব্রেক যন্ত্রাংশ', 'Brake pads, rotors, calipers and lines'),
    ('Electrical Parts', 'ইলেকট্রিক্যাল যন্ত্রাংশ', 'Batteries, alternators, starters and sensors'),
    ('Suspension', 'সাসপেনশন', 'Shocks, struts, springs and bushings'),
    ('Body Parts', 'বডি পার্টস', 'Panels, bumpers, mirrors and trim'),
    ('Lubricants', 'লুব্রিক্যান্ট', 'Engine oil, transmission fluid and greases'),
    ('Accessories', 'আনুষাঙ্গিক', 'Interior and exterior accessories');

-- ============================================
-- PART BRANDS (Bangladesh Market)
-- ============================================
CREATE TABLE part_brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    country_of_origin TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_part_brands_name ON part_brands(name);
CREATE INDEX idx_part_brands_active ON part_brands(is_active);

-- Pre-populate brands available in Bangladesh
INSERT INTO part_brands (name, country_of_origin) VALUES
    ('Bosch', 'Germany'),
    ('Denso', 'Japan'),
    ('NGK', 'Japan'),
    ('Mobil', 'USA'),
    ('Castrol', 'UK'),
    ('Shell', 'Netherlands'),
    ('Total', 'France'),
    ('Toyota Genuine', 'Japan'),
    ('Honda Genuine', 'Japan'),
    ('Local/Aftermarket', 'Bangladesh');

-- ============================================
-- PARTS
-- ============================================
CREATE TABLE parts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES part_categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES part_brands(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    name_bn TEXT,
    sku TEXT NOT NULL UNIQUE,
    part_number TEXT, -- OEM part number
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    cost_price DECIMAL(12, 2) NOT NULL CHECK (cost_price >= 0), -- BDT
    selling_price DECIMAL(12, 2) NOT NULL CHECK (selling_price >= 0), -- BDT
    min_stock_level INTEGER DEFAULT 5, -- Reorder alert threshold
    description TEXT,
    compatible_vehicles TEXT[], -- Array of vehicle makes/models
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parts_category ON parts(category_id);
CREATE INDEX idx_parts_brand ON parts(brand_id);
CREATE INDEX idx_parts_sku ON parts(sku);
CREATE INDEX idx_parts_part_number ON parts(part_number);
CREATE INDEX idx_parts_name ON parts(name);
CREATE INDEX idx_parts_quantity ON parts(quantity);
CREATE INDEX idx_parts_active ON parts(is_active);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================
CREATE TRIGGER update_service_categories_updated_at
    BEFORE UPDATE ON service_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON services
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_categories_updated_at
    BEFORE UPDATE ON part_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_part_brands_updated_at
    BEFORE UPDATE ON part_brands
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parts_updated_at
    BEFORE UPDATE ON parts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all new tables
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;

-- Service Categories Policies
CREATE POLICY "service_categories_select_admin" ON service_categories
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "service_categories_insert_super_admin" ON service_categories
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "service_categories_update_super_admin" ON service_categories
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "service_categories_delete_super_admin" ON service_categories
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

-- Services Policies
CREATE POLICY "services_select_admin" ON services
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "services_insert_super_admin" ON services
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "services_update_super_admin" ON services
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "services_delete_super_admin" ON services
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

-- Part Categories Policies
CREATE POLICY "part_categories_select_admin" ON part_categories
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "part_categories_insert_super_admin" ON part_categories
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "part_categories_update_super_admin" ON part_categories
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "part_categories_delete_super_admin" ON part_categories
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

-- Part Brands Policies
CREATE POLICY "part_brands_select_admin" ON part_brands
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "part_brands_insert_super_admin" ON part_brands
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "part_brands_update_super_admin" ON part_brands
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "part_brands_delete_super_admin" ON part_brands
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

-- Parts Policies
CREATE POLICY "parts_select_admin" ON parts
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

CREATE POLICY "parts_insert_super_admin" ON parts
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "parts_update_super_admin" ON parts
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'))
    WITH CHECK (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "parts_delete_super_admin" ON parts
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'super_admin'));

