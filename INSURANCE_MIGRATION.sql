-- ==========================================
-- INSURANCE MODULE MIGRATION
-- ==========================================

-- Drop existing enum if exists (to avoid conflicts)
DROP TYPE IF EXISTS "ClaimStatus" CASCADE;

-- Create ClaimStatus enum
CREATE TYPE "ClaimStatus" AS ENUM ('INITIATED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SETTLED', 'CANCELLED');

-- Create insurance_companies table
CREATE TABLE IF NOT EXISTS insurance_companies (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  "zipCode" TEXT,
  phone TEXT,
  email TEXT,
  "contactPerson" TEXT,
  website TEXT,
  terms TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "insurance_companies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "insurance_companies_tenantId_idx" ON insurance_companies("tenantId");

-- Create insurance_policies table
CREATE TABLE IF NOT EXISTS insurance_policies (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "policyName" TEXT NOT NULL,
  "policyNumber" TEXT NOT NULL,
  "policyType" TEXT NOT NULL,
  "coveragePercent" DOUBLE PRECISION NOT NULL,
  deductible DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maxCoverage" DOUBLE PRECISION,
  "validFrom" TIMESTAMP NOT NULL,
  "validUntil" TIMESTAMP NOT NULL,
  terms TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "insurance_policies_tenantId_policyNumber_key" UNIQUE ("tenantId", "policyNumber"),
  CONSTRAINT "insurance_policies_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT "insurance_policies_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES insurance_companies(id)
);

CREATE INDEX IF NOT EXISTS "insurance_policies_tenantId_idx" ON insurance_policies("tenantId");
CREATE INDEX IF NOT EXISTS "insurance_policies_companyId_idx" ON insurance_policies("companyId");

-- Create patient_insurance table
CREATE TABLE IF NOT EXISTS patient_insurance (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "policyNumber" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "coverageAmount" DOUBLE PRECISION,
  "remainingCoverage" DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  notes TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "patient_insurance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT "patient_insurance_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES patients(id),
  CONSTRAINT "patient_insurance_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES insurance_policies(id)
);

CREATE INDEX IF NOT EXISTS "patient_insurance_tenantId_idx" ON patient_insurance("tenantId");
CREATE INDEX IF NOT EXISTS "patient_insurance_patientId_idx" ON patient_insurance("patientId");
CREATE INDEX IF NOT EXISTS "patient_insurance_policyId_idx" ON patient_insurance("policyId");

-- Create insurance_claims table
CREATE TABLE IF NOT EXISTS insurance_claims (
  id TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "policyId" TEXT NOT NULL,
  "claimNumber" TEXT NOT NULL,
  "billId" TEXT,
  "claimDate" TIMESTAMP NOT NULL DEFAULT NOW(),
  "serviceDate" TIMESTAMP NOT NULL,
  services JSONB NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  deductible DOUBLE PRECISION NOT NULL,
  "coveredAmount" DOUBLE PRECISION NOT NULL,
  "patientBalance" DOUBLE PRECISION NOT NULL,
  status "ClaimStatus" NOT NULL DEFAULT 'INITIATED',
  "reviewNotes" TEXT,
  "approvedBy" TEXT,
  "approvedDate" TIMESTAMP,
  "rejectionReason" TEXT,
  documents JSONB,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "insurance_claims_tenantId_claimNumber_key" UNIQUE ("tenantId", "claimNumber"),
  CONSTRAINT "insurance_claims_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES tenants(id) ON DELETE CASCADE,
  CONSTRAINT "insurance_claims_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES patients(id),
  CONSTRAINT "insurance_claims_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES insurance_policies(id),
  CONSTRAINT "insurance_claims_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES staff(id),
  CONSTRAINT "insurance_claims_billId_fkey" FOREIGN KEY ("billId") REFERENCES bills(id)
);

CREATE INDEX IF NOT EXISTS "insurance_claims_tenantId_idx" ON insurance_claims("tenantId");
CREATE INDEX IF NOT EXISTS "insurance_claims_patientId_idx" ON insurance_claims("patientId");
CREATE INDEX IF NOT EXISTS "insurance_claims_policyId_idx" ON insurance_claims("policyId");
CREATE INDEX IF NOT EXISTS "insurance_claims_status_idx" ON insurance_claims(status);

-- Verify tables created
SELECT 
  'insurance_companies' as table_name,
  COUNT(*) as row_count
FROM insurance_companies
UNION ALL
SELECT 
  'insurance_policies' as table_name,
  COUNT(*) as row_count
FROM insurance_policies
UNION ALL
SELECT 
  'patient_insurance' as table_name,
  COUNT(*) as row_count
FROM patient_insurance
UNION ALL
SELECT 
  'insurance_claims' as table_name,
  COUNT(*) as row_count
FROM insurance_claims;
