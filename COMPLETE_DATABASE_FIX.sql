-- ==========================================
-- COMPLETE DATABASE FIX
-- Fix all schema mismatches for HMS SaaS
-- ==========================================

-- ==========================================
-- 1. OPD MODULE FIX
-- ==========================================
-- Add fee column to opd_visits table
ALTER TABLE opd_visits ADD COLUMN IF NOT EXISTS "fee" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing OPD records
UPDATE opd_visits SET "fee" = 0 WHERE "fee" IS NULL;

-- ==========================================
-- 2. BILLING MODULE ENHANCEMENTS
-- ==========================================
-- Add new fields to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "insuranceCovered" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "finalized" BOOLEAN NOT NULL DEFAULT false;

-- Add discount field to bill_items table
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing billing records
UPDATE bills SET "insuranceCovered" = 0 WHERE "insuranceCovered" IS NULL;
UPDATE bills SET "finalized" = false WHERE "finalized" IS NULL;
UPDATE bill_items SET "discount" = 0 WHERE "discount" IS NULL;

-- ==========================================
-- 3. VERIFICATION QUERIES
-- ==========================================
-- Verify OPD columns
SELECT 'OPD Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'opd_visits' AND column_name IN ('fee')
ORDER BY column_name;

-- Verify Billing columns
SELECT 'Billing Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bills' AND column_name IN ('insuranceCovered', 'finalized')
ORDER BY column_name;

-- Verify Bill Items columns
SELECT 'Bill Items Columns' as check_type, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'bill_items' AND column_name IN ('discount')
ORDER BY column_name;

-- ==========================================
-- 4. DATA INTEGRITY CHECKS
-- ==========================================
-- Check for any NULL values that shouldn't exist
SELECT 
  'OPD Visits with NULL fee' as check_type,
  COUNT(*) as count
FROM opd_visits
WHERE fee IS NULL;

SELECT 
  'Bills with NULL insuranceCovered' as check_type,
  COUNT(*) as count
FROM bills
WHERE "insuranceCovered" IS NULL;

SELECT 
  'Bills with NULL finalized' as check_type,
  COUNT(*) as count
FROM bills
WHERE finalized IS NULL;

SELECT 
  'Bill Items with NULL discount' as check_type,
  COUNT(*) as count
FROM bill_items
WHERE discount IS NULL;

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- All schema mismatches should now be resolved
-- Redeploy your application after running this migration
