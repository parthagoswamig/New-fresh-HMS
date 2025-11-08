-- ==========================================
-- RADIOLOGY MODULE MIGRATION
-- ==========================================

-- Create RadiologyStatus enum
DO $$ BEGIN
  CREATE TYPE "RadiologyStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create radiology_tests table
CREATE TABLE IF NOT EXISTS radiology_tests (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "radiology_tests_tenantId_code_key" UNIQUE ("tenantId", code),
  CONSTRAINT "radiology_tests_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "radiology_tests_tenantId_idx" ON radiology_tests("tenantId");

-- Create patient_radiology table
CREATE TABLE IF NOT EXISTS patient_radiology (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "testId" TEXT NOT NULL,
  "resultSummary" TEXT,
  radiologist TEXT,
  "reportUrl" TEXT,
  status "RadiologyStatus" NOT NULL DEFAULT 'PENDING'::"RadiologyStatus",
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "patient_radiology_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT "patient_radiology_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES patients(id),
  CONSTRAINT "patient_radiology_testId_fkey" FOREIGN KEY ("testId") REFERENCES radiology_tests(id),
  CONSTRAINT "patient_radiology_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES staff(id)
);

CREATE INDEX IF NOT EXISTS "patient_radiology_tenantId_idx" ON patient_radiology("tenantId");
CREATE INDEX IF NOT EXISTS "patient_radiology_patientId_idx" ON patient_radiology("patientId");

-- Verify tables created
SELECT 
  'radiology_tests' as table_name,
  COUNT(*) as row_count
FROM radiology_tests
UNION ALL
SELECT 
  'patient_radiology' as table_name,
  COUNT(*) as row_count
FROM patient_radiology;
