-- ==========================================
-- LABORATORY MODULE - Complete Migration
-- ==========================================

-- 1. Enhance lab_tests table
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS "unit" TEXT;
ALTER TABLE lab_tests ADD COLUMN IF NOT EXISTS "referenceRange" TEXT;

-- 2. Create lab_entries table
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

-- 3. Create lab_entry_items table
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

-- 4. Create lab_reports table
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

-- Verify lab_tests columns
SELECT 'Lab Tests Columns' as check_type, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'lab_tests' AND column_name IN ('unit', 'referenceRange')
ORDER BY column_name;

-- Verify lab_entries table
SELECT 'Lab Entries Table' as check_type, COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'lab_entries';

-- Verify lab_entry_items table
SELECT 'Lab Entry Items Table' as check_type, COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'lab_entry_items';

-- Verify lab_reports table
SELECT 'Lab Reports Table' as check_type, COUNT(*) as table_exists
FROM information_schema.tables
WHERE table_name = 'lab_reports';

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
