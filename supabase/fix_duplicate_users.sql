-- Fix: Remove duplicate rows in users table
-- Keeps the oldest entry for each user id

-- Check duplicates first (run this SELECT to see them):
-- SELECT id, count(*) FROM users GROUP BY id HAVING count(*) > 1;

-- Remove duplicates (keeps the row with the smallest ctid = oldest physical row)
DELETE FROM users a USING users b
WHERE a.id = b.id AND a.ctid > b.ctid;
