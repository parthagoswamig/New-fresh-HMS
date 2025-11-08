-- ==========================================
-- FINAL COMPLETE MIGRATION
-- HMS SaaS - All Module Enhancements
-- ==========================================
-- Run this single script to apply all changes
-- ==========================================

-- ==========================================
-- 1. OPD MODULE FIX
-- ==========================================
ALTER TABLE opd_visits ADD COLUMN IF NOT EXISTS "fee" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE opd_visits SET "fee" = 0 WHERE "fee" IS NULL;

-- ==========================================
-- 2. BILLING MODULE ENHANCEMENTS
-- ==========================================
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "insuranceCovered" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "finalized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE bills SET "insuranceCovered" = 0 WHERE "insuranceCovered" IS NULL;
UPDATE bills SET "finalized" = false WHERE "finalized" IS NULL;
UPDATE bill_items SET "discount" = 0 WHERE "discount" IS NULL;

-- ==========================================
-- 3. LABORATORY MODULE - ENHANCE LAB TESTS
-- ==========================================
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS "unit" TEXT;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS "referenceRange" TEXT;

-- ==========================================
-- 4. LABORATORY MODULE - CREATE LAB ENTRIES
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_entries (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "entryNumber" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'ORDERED',
  "sampleType" TEXT,
  notes TEXT,
  "billedToFinal" BOOLEAN NOT NULL DEFAULT false,
  "billId" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "lab_entries_tenantId_entryNumber_key" UNIQUE ("tenantId", "entryNumber"),
  CONSTRAINT "lab_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT "lab_entries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES patients(id),
  CONSTRAINT "lab_entries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES staff(id),
  CONSTRAINT "lab_entries_billId_fkey" FOREIGN KEY ("billId") REFERENCES bills(id)
);

CREATE INDEX IF NOT EXISTS "lab_entries_tenantId_idx" ON lab_entries("tenantId");
CREATE INDEX IF NOT EXISTS "lab_entries_patientId_idx" ON lab_entries("patientId");

-- ==========================================
-- 5. LABORATORY MODULE - CREATE LAB ENTRY ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_entry_items (
  id TEXT PRIMARY KEY,
  "labEntryId" TEXT NOT NULL,
  "labTestId" TEXT NOT NULL,
  "testName" TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  result TEXT,
  unit TEXT,
  "referenceRange" TEXT,
  status TEXT NOT NULL DEFAULT 'ORDERED',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "lab_entry_items_labEntryId_fkey" FOREIGN KEY ("labEntryId") REFERENCES lab_entries(id) ON DELETE CASCADE,
  CONSTRAINT "lab_entry_items_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES lab_tests(id)
);

-- ==========================================
-- 6. LABORATORY MODULE - CREATE LAB REPORTS
-- ==========================================
CREATE TABLE IF NOT EXISTS lab_reports (
  id TEXT PRIMARY KEY,
  "labEntryId" TEXT NOT NULL UNIQUE,
  comments TEXT,
  findings TEXT,
  interpretation TEXT,
  printed BOOLEAN NOT NULL DEFAULT false,
  "printedAt" TIMESTAMP,
  "reportedById" TEXT NOT NULL,
  "reportedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "lab_reports_labEntryId_key" UNIQUE ("labEntryId"),
  CONSTRAINT "lab_reports_labEntryId_fkey" FOREIGN KEY ("labEntryId") REFERENCES lab_entries(id) ON DELETE CASCADE,
  CONSTRAINT "lab_reports_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES staff(id)
);

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify OPD columns
SELECT 'OPD Columns' as check_type, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'opd_visits' AND column_name = 'fee';

-- Verify Billing columns
SELECT 'Billing Columns' as check_type, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bills' AND column_name IN ('insuranceCovered', 'finalized')
ORDER BY column_name;

-- Verify Bill Items columns
SELECT 'Bill Items Columns' as check_type, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bill_items' AND column_name = 'discount';

-- Verify Lab Tests columns
SELECT 'Lab Tests Columns' as check_type, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lab_tests' AND column_name IN ('unit', 'referenceRange')
ORDER BY column_name;

-- Verify Lab tables created
SELECT 'Lab Tables' as check_type, table_name
FROM information_schema.tables
WHERE table_name IN ('lab_entries', 'lab_entry_items', 'lab_reports')
ORDER BY table_name;

-- Count records (should all be 0 for new tables)
SELECT 'Lab Entries Count' as check_type, COUNT(*) as count FROM lab_entries;
SELECT 'Lab Entry Items Count' as check_type, COUNT(*) as count FROM lab_entry_items;
SELECT 'Lab Reports Count' as check_type, COUNT(*) as count FROM lab_reports;

-- Data integrity checks
SELECT 'OPD NULL fee' as check_type, COUNT(*) as count FROM opd_visits WHERE fee IS NULL;
SELECT 'Bills NULL insurance' as check_type, COUNT(*) as count FROM bills WHERE "insuranceCovered" IS NULL;
SELECT 'Bills NULL finalized' as check_type, COUNT(*) as count FROM bills WHERE finalized IS NULL;
SELECT 'Bill Items NULL discount' as check_type, COUNT(*) as count FROM bill_items WHERE discount IS NULL;

-- ==========================================
-- MIGRATION COMPLETE ✅
-- ==========================================
-- All enhancements applied:
-- ✅ OPD fee column added
-- ✅ Billing enhanced (insurance, finalized, discounts)
-- ✅ Laboratory module complete (entries, items, reports)
-- ✅ All foreign keys and indexes created
-- ✅ All default values set
-- ✅ Zero data loss (backward compatible)
-- 
-- Next Steps:
-- 1. Verify all checks above show expected results
-- 2. Commit and push code changes
-- 3. Deploy to Vercel (auto-regenerates Prisma client)
-- 4. Test all endpoints
-- ==========================================
