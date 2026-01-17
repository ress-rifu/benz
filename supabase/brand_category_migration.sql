-- =====================================================
-- MIGRATION: Add category_id to part_brands table
-- This allows brands to be organized by category
-- =====================================================

-- Step 1: Add category_id column to part_brands (nullable initially for existing brands)
ALTER TABLE part_brands
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES part_categories(id) ON DELETE SET NULL;

-- Step 2: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_part_brands_category_id ON part_brands(category_id);

-- Step 3: (Optional) If you want to assign existing brands to a default category,
-- uncomment and modify the following:
-- UPDATE part_brands SET category_id = 'YOUR_DEFAULT_CATEGORY_UUID' WHERE category_id IS NULL;

-- Verify the change
SELECT 
    pb.id,
    pb.name as brand_name,
    pc.name as category_name
FROM part_brands pb
LEFT JOIN part_categories pc ON pb.category_id = pc.id
ORDER BY pc.name, pb.name;
