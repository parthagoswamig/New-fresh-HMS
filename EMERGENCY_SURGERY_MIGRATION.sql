-- =====================================================
-- EMERGENCY & SURGERY MODULES MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- SURGERY MODULE
-- =====================================================

-- Create Surgery Status Enum
CREATE TYPE "SurgeryStatus" AS ENUM (
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED'
);

-- Create Surgery Type Enum
CREATE TYPE "SurgeryType" AS ENUM (
  'GENERAL',
  'ORTHOPEDIC',
  'CARDIAC',
  'NEUROSURGERY',
  'PLASTIC',
  'GYNECOLOGICAL',
  'UROLOGICAL',
  'OPHTHALMIC',
  'ENT',
  'PEDIATRIC',
  'EMERGENCY',
  'OTHER'
);

-- Create Operating Room Table
CREATE TABLE "operating_rooms" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "roomNumber" TEXT NOT NULL,
  "roomName" TEXT NOT NULL,
  "floor" TEXT,
  "capacity" INTEGER DEFAULT 1,
  "equipment" TEXT,
  "isAvailable" BOOLEAN DEFAULT true,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "operating_rooms_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "operating_rooms_tenantId_roomNumber_key" UNIQUE ("tenantId", "roomNumber")
);

CREATE INDEX "operating_rooms_tenantId_idx" ON "operating_rooms"("tenantId");

-- Create Surgery Table
CREATE TABLE "surgeries" (
  "id" TEXT PRIMARY KEY,
  "surgeryNumber" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "surgeonId" TEXT NOT NULL,
  "anesthesiologistId" TEXT,
  "otRoomId" TEXT NOT NULL,
  "billId" TEXT,
  "surgeryType" "SurgeryType" NOT NULL,
  "surgeryName" TEXT NOT NULL,
  "description" TEXT,
  "scheduledDate" TIMESTAMP(3) NOT NULL,
  "scheduledDuration" INTEGER NOT NULL,
  "status" "SurgeryStatus" DEFAULT 'SCHEDULED',
  "actualStartTime" TIMESTAMP(3),
  "actualEndTime" TIMESTAMP(3),
  "actualDuration" INTEGER,
  "preOpNotes" TEXT,
  "postOpNotes" TEXT,
  "complications" TEXT,
  "anesthesiaType" TEXT,
  "estimatedCost" DOUBLE PRECISION,
  "actualCost" DOUBLE PRECISION,
  "cancelledReason" TEXT,
  "cancelledAt" TIMESTAMP(3),
  "cancelledById" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "surgeries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "surgeries_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id"),
  CONSTRAINT "surgeries_surgeonId_fkey" FOREIGN KEY ("surgeonId") REFERENCES "staff"("id"),
  CONSTRAINT "surgeries_anesthesiologistId_fkey" FOREIGN KEY ("anesthesiologistId") REFERENCES "staff"("id"),
  CONSTRAINT "surgeries_otRoomId_fkey" FOREIGN KEY ("otRoomId") REFERENCES "operating_rooms"("id"),
  CONSTRAINT "surgeries_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id"),
  CONSTRAINT "surgeries_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff"("id"),
  CONSTRAINT "surgeries_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "staff"("id"),
  CONSTRAINT "surgeries_tenantId_surgeryNumber_key" UNIQUE ("tenantId", "surgeryNumber")
);

CREATE INDEX "surgeries_tenantId_idx" ON "surgeries"("tenantId");
CREATE INDEX "surgeries_patientId_idx" ON "surgeries"("patientId");
CREATE INDEX "surgeries_surgeonId_idx" ON "surgeries"("surgeonId");
CREATE INDEX "surgeries_status_idx" ON "surgeries"("status");
CREATE INDEX "surgeries_scheduledDate_idx" ON "surgeries"("scheduledDate");

-- =====================================================
-- EMERGENCY MODULE
-- =====================================================

-- Create Emergency Severity Enum
CREATE TYPE "EmergencySeverity" AS ENUM (
  'CRITICAL',
  'SERIOUS',
  'MODERATE',
  'STABLE'
);

-- Create Emergency Status Enum
CREATE TYPE "EmergencyStatus" AS ENUM (
  'WAITING',
  'UNDER_TREATMENT',
  'ADMITTED',
  'TRANSFERRED',
  'DISCHARGED',
  'DECEASED'
);

-- Create Arrival Mode Enum
CREATE TYPE "ArrivalMode" AS ENUM (
  'AMBULANCE',
  'WALK_IN',
  'REFERRED',
  'POLICE',
  'OTHER'
);

-- Create Emergency Cases Table
CREATE TABLE "emergency_cases" (
  "id" TEXT PRIMARY KEY,
  "emergencyNumber" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  
  -- Patient Information
  "patientId" TEXT,
  "quickName" TEXT,
  "quickAge" INTEGER,
  "quickGender" TEXT,
  "quickContact" TEXT,
  "quickAddress" TEXT,
  
  -- Triage Information
  "severity" "EmergencySeverity" NOT NULL,
  "chiefComplaint" TEXT NOT NULL,
  "arrivalMode" "ArrivalMode" NOT NULL,
  "arrivalTime" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "firstResponderId" TEXT,
  "triageNurseId" TEXT,
  "attendingDoctorId" TEXT,
  
  -- Vitals
  "bloodPressure" TEXT,
  "heartRate" INTEGER,
  "temperature" DOUBLE PRECISION,
  "respiratoryRate" INTEGER,
  "oxygenSaturation" INTEGER,
  
  -- Clinical Information
  "primaryDiagnosis" TEXT,
  "secondaryDiagnosis" TEXT,
  "allergies" TEXT,
  "currentMedications" TEXT,
  "medicalHistory" TEXT,
  
  -- Treatment Information (stored as JSONB)
  "progressNotes" JSONB,
  "interventions" JSONB,
  "investigations" JSONB,
  "medications" JSONB,
  
  -- Status & Flow
  "status" "EmergencyStatus" DEFAULT 'WAITING',
  "treatmentStartTime" TIMESTAMP(3),
  "treatmentEndTime" TIMESTAMP(3),
  
  -- Disposition
  "admittedToIpdId" TEXT,
  "transferredTo" TEXT,
  "transferReason" TEXT,
  "dischargeTime" TIMESTAMP(3),
  "dischargeSummary" TEXT,
  "dischargeAdvice" TEXT,
  "followUpDate" TIMESTAMP(3),
  
  -- Death Information
  "deathTime" TIMESTAMP(3),
  "causeOfDeath" TEXT,
  "deathCertificateUrl" TEXT,
  
  -- Billing
  "billId" TEXT,
  "estimatedCost" DOUBLE PRECISION,
  "actualCost" DOUBLE PRECISION,
  
  -- Audit
  "createdById" TEXT NOT NULL,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "emergency_cases_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "emergency_cases_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id"),
  CONSTRAINT "emergency_cases_firstResponderId_fkey" FOREIGN KEY ("firstResponderId") REFERENCES "staff"("id"),
  CONSTRAINT "emergency_cases_triageNurseId_fkey" FOREIGN KEY ("triageNurseId") REFERENCES "staff"("id"),
  CONSTRAINT "emergency_cases_attendingDoctorId_fkey" FOREIGN KEY ("attendingDoctorId") REFERENCES "staff"("id"),
  CONSTRAINT "emergency_cases_admittedToIpdId_fkey" FOREIGN KEY ("admittedToIpdId") REFERENCES "ipd_admissions"("id"),
  CONSTRAINT "emergency_cases_billId_fkey" FOREIGN KEY ("billId") REFERENCES "bills"("id"),
  CONSTRAINT "emergency_cases_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff"("id"),
  CONSTRAINT "emergency_cases_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "staff"("id"),
  CONSTRAINT "emergency_cases_tenantId_emergencyNumber_key" UNIQUE ("tenantId", "emergencyNumber")
);

CREATE INDEX "emergency_cases_tenantId_idx" ON "emergency_cases"("tenantId");
CREATE INDEX "emergency_cases_patientId_idx" ON "emergency_cases"("patientId");
CREATE INDEX "emergency_cases_status_idx" ON "emergency_cases"("status");
CREATE INDEX "emergency_cases_severity_idx" ON "emergency_cases"("severity");
CREATE INDEX "emergency_cases_arrivalTime_idx" ON "emergency_cases"("arrivalTime");

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE "operating_rooms" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "surgeries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "emergency_cases" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Operating Rooms Policies
CREATE POLICY "operating_rooms_tenant_isolation" ON "operating_rooms"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Surgeries Policies
CREATE POLICY "surgeries_tenant_isolation" ON "surgeries"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Emergency Cases Policies
CREATE POLICY "emergency_cases_tenant_isolation" ON "emergency_cases"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_operating_rooms_updated_at
  BEFORE UPDATE ON "operating_rooms"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_surgeries_updated_at
  BEFORE UPDATE ON "surgeries"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_cases_updated_at
  BEFORE UPDATE ON "emergency_cases"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON "operating_rooms" TO authenticated;
GRANT ALL ON "surgeries" TO authenticated;
GRANT ALL ON "emergency_cases" TO authenticated;

-- =====================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- =====================================================

-- You can add sample operating rooms here if needed
-- INSERT INTO "operating_rooms" ("id", "tenantId", "roomNumber", "roomName", "floor", "capacity", "isAvailable", "isActive")
-- VALUES 
--   (gen_random_uuid()::text, 'your-tenant-id', 'OT-01', 'Operating Theater 1', '2nd Floor', 2, true, true),
--   (gen_random_uuid()::text, 'your-tenant-id', 'OT-02', 'Operating Theater 2', '2nd Floor', 2, true, true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('operating_rooms', 'surgeries', 'emergency_cases');

-- Verify enums were created
SELECT typname 
FROM pg_type 
WHERE typname IN ('SurgeryStatus', 'SurgeryType', 'EmergencySeverity', 'EmergencyStatus', 'ArrivalMode');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Surgery Module: ✅ Operating Rooms + Surgeries
-- Emergency Module: ✅ Emergency Cases with Triage
-- RLS Policies: ✅ Tenant Isolation Enabled
-- Triggers: ✅ Auto-update timestamps
-- Indexes: ✅ Performance optimized
-- =====================================================
