-- Bangladesh Automotive Market Seed Data
-- Run this in Supabase SQL Editor
-- Uses ON CONFLICT to safely re-run (skips existing rows)

-- ============================================
-- SERVICE CATEGORIES
-- ============================================
INSERT INTO service_categories (name, name_bn, description) VALUES
    ('Engine Repair', 'ইঞ্জিন মেরামত', 'Complete engine diagnostics and repair services'),
    ('AC Service', 'এসি সার্ভিস', 'Air conditioning maintenance and repair'),
    ('Oil Change', 'তেল পরিবর্তন', 'Engine oil and filter replacement'),
    ('Brake Service', 'ব্রেক সার্ভিস', 'Brake inspection, repair and replacement'),
    ('Tire Service', 'টায়ার সার্ভিস', 'Tire rotation, balancing and replacement'),
    ('Electrical', 'ইলেকট্রিক্যাল', 'Electrical system diagnostics and repair'),
    ('Body Work', 'বডি ওয়ার্ক', 'Dent repair, painting and body restoration'),
    ('General Service', 'সাধারণ সার্ভিস', 'Regular maintenance and inspection')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SERVICES (BDT prices)
-- ============================================
INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Engine Oil Leak Repair', 'ইঞ্জিন অয়েল লিক মেরামত', 2500, 120
FROM service_categories sc
WHERE sc.name = 'Engine Repair'
  AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Engine Oil Leak Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Head Gasket Replacement', 'হেড গাসকেট পরিবর্তন', 8000, 240
FROM service_categories sc WHERE sc.name = 'Engine Repair'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Head Gasket Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Timing Belt Replacement', 'টাইমিং বেল্ট পরিবর্তন', 4500, 180
FROM service_categories sc WHERE sc.name = 'Engine Repair'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Timing Belt Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Engine Overhaul', 'ইঞ্জিন ওভারহল', 25000, 480
FROM service_categories sc WHERE sc.name = 'Engine Repair'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Engine Overhaul');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Radiator Repair', 'রেডিয়েটর মেরামত', 1500, 90
FROM service_categories sc WHERE sc.name = 'Engine Repair'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Radiator Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'AC Gas Refill (R134a)', 'এসি গ্যাস রিফিল', 1200, 60
FROM service_categories sc WHERE sc.name = 'AC Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'AC Gas Refill (R134a)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'AC Compressor Repair', 'এসি কম্প্রেসর মেরামত', 3500, 180
FROM service_categories sc WHERE sc.name = 'AC Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'AC Compressor Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'AC Full Service', 'এসি ফুল সার্ভিস', 2500, 120
FROM service_categories sc WHERE sc.name = 'AC Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'AC Full Service');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'AC Condenser Cleaning', 'কন্ডেনসার ক্লিনিং', 800, 45
FROM service_categories sc WHERE sc.name = 'AC Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'AC Condenser Cleaning');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'AC Blower Motor Replacement', 'ব্লোয়ার মোটর পরিবর্তন', 2000, 90
FROM service_categories sc WHERE sc.name = 'AC Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'AC Blower Motor Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Engine Oil Change (Synthetic)', 'সিনথেটিক অয়েল পরিবর্তন', 1500, 45
FROM service_categories sc WHERE sc.name = 'Oil Change'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Engine Oil Change (Synthetic)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Engine Oil Change (Mineral)', 'মিনারেল অয়েল পরিবর্তন', 800, 30
FROM service_categories sc WHERE sc.name = 'Oil Change'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Engine Oil Change (Mineral)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Oil + Filter Change', 'অয়েল ও ফিল্টার পরিবর্তন', 1200, 45
FROM service_categories sc WHERE sc.name = 'Oil Change'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Oil + Filter Change');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Transmission Oil Change', 'ট্রান্সমিশন অয়েল পরিবর্তন', 2000, 60
FROM service_categories sc WHERE sc.name = 'Oil Change'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Transmission Oil Change');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Brake Pad Replacement (Front)', 'সামনের ব্রেক প্যাড পরিবর্তন', 1500, 90
FROM service_categories sc WHERE sc.name = 'Brake Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Brake Pad Replacement (Front)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Brake Pad Replacement (Rear)', 'পিছনের ব্রেক প্যাড পরিবর্তন', 1200, 75
FROM service_categories sc WHERE sc.name = 'Brake Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Brake Pad Replacement (Rear)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Brake Disc Resurfacing', 'ব্রেক ডিস্ক রিসারফেসিং', 800, 60
FROM service_categories sc WHERE sc.name = 'Brake Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Brake Disc Resurfacing');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Brake Fluid Change', 'ব্রেক ফ্লুইড পরিবর্তন', 600, 45
FROM service_categories sc WHERE sc.name = 'Brake Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Brake Fluid Change');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Full Brake Service', 'ফুল ব্রেক সার্ভিস', 3500, 180
FROM service_categories sc WHERE sc.name = 'Brake Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Full Brake Service');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Tire Rotation', 'টায়ার রোটেশন', 400, 30
FROM service_categories sc WHERE sc.name = 'Tire Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Tire Rotation');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Wheel Balancing', 'হুইল ব্যালান্সিং', 300, 30
FROM service_categories sc WHERE sc.name = 'Tire Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Wheel Balancing');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Tire Puncture Repair', 'টায়ার পাংচার মেরামত', 150, 20
FROM service_categories sc WHERE sc.name = 'Tire Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Tire Puncture Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Tire Replacement (per tire)', 'টায়ার পরিবর্তন', 500, 45
FROM service_categories sc WHERE sc.name = 'Tire Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Tire Replacement (per tire)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Battery Replacement', 'ব্যাটারি পরিবর্তন', 500, 30
FROM service_categories sc WHERE sc.name = 'Electrical'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Battery Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Alternator Repair', 'অল্টারনেটর মেরামত', 2500, 120
FROM service_categories sc WHERE sc.name = 'Electrical'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Alternator Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Starter Motor Repair', 'স্টার্টার মোটর মেরামত', 2000, 90
FROM service_categories sc WHERE sc.name = 'Electrical'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Starter Motor Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Headlight Bulb Replacement', 'হেডলাইট বাল্ব পরিবর্তন', 200, 20
FROM service_categories sc WHERE sc.name = 'Electrical'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Headlight Bulb Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Wiring Repair', 'ওয়্যারিং মেরামত', 1500, 120
FROM service_categories sc WHERE sc.name = 'Electrical'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Wiring Repair');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Dent Repair (Small)', 'ছোট ডেন্ট মেরামত', 1500, 120
FROM service_categories sc WHERE sc.name = 'Body Work'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Dent Repair (Small)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Dent Repair (Large)', 'বড় ডেন্ট মেরামত', 4000, 240
FROM service_categories sc WHERE sc.name = 'Body Work'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Dent Repair (Large)');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Panel Painting', 'প্যানেল পেইন্টিং', 5000, 480
FROM service_categories sc WHERE sc.name = 'Body Work'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Panel Painting');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Full Body Polish', 'ফুল বডি পলিশ', 2000, 180
FROM service_categories sc WHERE sc.name = 'Body Work'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Full Body Polish');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Full Car Checkup', 'ফুল গাড়ি চেকআপ', 800, 60
FROM service_categories sc WHERE sc.name = 'General Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Full Car Checkup');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Wheel Alignment', 'হুইল অ্যালাইনমেন্ট', 600, 45
FROM service_categories sc WHERE sc.name = 'General Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Wheel Alignment');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Wheel Bearing Replacement', 'হুইল ব্যারিং পরিবর্তন', 800, 90
FROM service_categories sc WHERE sc.name = 'General Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Wheel Bearing Replacement');

INSERT INTO services (category_id, name, name_bn, price, duration_minutes)
SELECT sc.id, 'Suspension Check', 'সাসপেনশন চেক', 400, 30
FROM service_categories sc WHERE sc.name = 'General Service'
AND NOT EXISTS (SELECT 1 FROM services s WHERE s.category_id = sc.id AND s.name = 'Suspension Check');

-- ============================================
-- PART CATEGORIES
-- ============================================
INSERT INTO part_categories (name, name_bn, description) VALUES
    ('Engine Parts', 'ইঞ্জিন যন্ত্রাংশ', 'Engine components and assemblies'),
    ('Filters', 'ফিল্টার', 'Oil, air, fuel and cabin filters'),
    ('Brake Parts', 'ব্রেক যন্ত্রাংশ', 'Brake pads, rotors, calipers and lines'),
    ('Electrical Parts', 'ইলেকট্রিক্যাল যন্ত্রাংশ', 'Batteries, alternators, starters and sensors'),
    ('Suspension', 'সাসপেনশন', 'Shocks, struts, springs and bushings'),
    ('Body Parts', 'বডি পার্টস', 'Panels, bumpers, mirrors and trim'),
    ('Lubricants', 'লুব্রিক্যান্ট', 'Engine oil, transmission fluid and greases'),
    ('Accessories', 'আনুষাঙ্গিক', 'Interior and exterior accessories')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PART BRANDS (Bangladesh market)
-- ============================================
INSERT INTO part_brands (name, country_of_origin) VALUES
    ('Bosch', 'Germany'),
    ('Denso', 'Japan'),
    ('NGK', 'Japan'),
    ('Castrol', 'UK'),
    ('Shell', 'Netherlands'),
    ('Toyota Genuine', 'Japan'),
    ('Honda Genuine', 'Japan'),
    ('Rahimafrooz', 'Bangladesh'),
    ('Energypac', 'Bangladesh'),
    ('CEAT', 'India'),
    ('MRF', 'India'),
    ('Apollo', 'India'),
    ('Local/Aftermarket', 'Bangladesh')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- PARTS (BDT prices, Bangladesh market)
-- ============================================
INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity, compatible_vehicles)
SELECT pc.id, pb.id, 'Oil Filter', 'অয়েল ফিল্টার', 'FLT-OIL-001', 350, 500, 20, ARRAY['Toyota','Honda','Nissan']
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Filters' AND pb.name = 'Denso'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity, compatible_vehicles)
SELECT pc.id, pb.id, 'Air Filter', 'এয়ার ফিল্টার', 'FLT-AIR-001', 450, 650, 15, ARRAY['Toyota','Honda']
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Filters' AND pb.name = 'Denso'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Cabin Filter', 'কেবিন ফিল্টার', 'FLT-CAB-001', 250, 400, 25
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Filters' AND pb.name = 'Local/Aftermarket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity, compatible_vehicles)
SELECT pc.id, pb.id, 'Brake Pad Set (Front)', 'সামনের ব্রেক প্যাড', 'BRK-PAD-F-001', 1200, 1800, 10, ARRAY['Toyota','Honda']
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Brake Parts' AND pb.name = 'Bosch'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Brake Pad Set (Rear)', 'পিছনের ব্রেক প্যাড', 'BRK-PAD-R-001', 800, 1200, 12
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Brake Parts' AND pb.name = 'Local/Aftermarket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Car Battery 45Ah', 'কার ব্যাটারি ৪৫এএইচ', 'BAT-45-001', 5500, 7500, 8
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Electrical Parts' AND pb.name = 'Rahimafrooz'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Car Battery 60Ah', 'কার ব্যাটারি ৬০এএইচ', 'BAT-60-001', 7500, 9500, 6
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Electrical Parts' AND pb.name = 'Energypac'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Spark Plug Set (4pcs)', 'স্পার্ক প্লাগ সেট', 'SPK-001', 600, 900, 20
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Electrical Parts' AND pb.name = 'Denso'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Engine Oil 5W-30 (4L)', 'ইঞ্জিন অয়েল ৫ডব্লিউ-৩০', 'OIL-CAS-5W30', 2200, 2800, 24
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Lubricants' AND pb.name = 'Castrol'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Engine Oil 10W-40 (4L)', 'ইঞ্জিন অয়েল ১০ডব্লিউ-৪০', 'OIL-SHL-10W40', 1800, 2400, 18
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Lubricants' AND pb.name = 'Shell'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Brake Fluid DOT 3', 'ব্রেক ফ্লুইড', 'FLU-BRK-001', 200, 350, 30
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Lubricants' AND pb.name = 'Local/Aftermarket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Ignition Coil', 'ইগনিশন কয়েল', 'IGN-COIL-001', 1500, 2200, 8
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Engine Parts' AND pb.name = 'NGK'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Radiator Cap', 'রেডিয়েটর ক্যাপ', 'RAD-CAP-001', 150, 250, 15
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Engine Parts' AND pb.name = 'Denso'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Shock Absorber (Front)', 'সামনের শক অ্যাবজরবার', 'SUS-SHK-F-001', 1200, 1800, 6
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Suspension' AND pb.name = 'Local/Aftermarket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Stabilizer Link', 'স্টেবিলাইজার লিংক', 'SUS-LINK-001', 350, 550, 12
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Suspension' AND pb.name = 'Local/Aftermarket'
ON CONFLICT (sku) DO NOTHING;

INSERT INTO parts (category_id, brand_id, name, name_bn, sku, cost_price, selling_price, quantity)
SELECT pc.id, pb.id, 'Alternator', 'অল্টারনেটর', 'ALT-001', 8000, 12000, 3
FROM part_categories pc
CROSS JOIN part_brands pb
WHERE pc.name = 'Electrical Parts' AND pb.name = 'Bosch'
ON CONFLICT (sku) DO NOTHING;
