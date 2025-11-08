-- ==========================================
-- CREATE STAFF RECORDS FOR EXISTING USERS
-- ==========================================
-- This script creates staff records for users who don't have one
-- Run this AFTER the main migration
-- ==========================================

-- Create staff records for all users who don't have a staff record
-- This ensures all users can create lab entries
INSERT INTO staff (
  id,
  "tenantId",
  "userId",
  "employeeId",
  "departmentId",
  "dateOfJoining",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT 
  gen_random_uuid()::text as id,
  u."tenantId",
  u.id as "userId",
  'EMP' || LPAD(CAST(ROW_NUMBER() OVER (PARTITION BY u."tenantId" ORDER BY u."createdAt") AS TEXT), 4, '0') as "employeeId",
  NULL as "departmentId",
  COALESCE(u."createdAt", NOW()) as "dateOfJoining",
  u."isActive",
  NOW() as "createdAt",
  NOW() as "updatedAt"
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM staff s WHERE s."userId" = u.id
)
AND u."isActive" = true
AND u.role IN ('SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN');

-- Verify the creation
SELECT 
  u.email,
  u."firstName",
  u."lastName",
  u.role,
  s.id as staff_id,
  s."employeeId",
  s."dateOfJoining"
FROM users u
LEFT JOIN staff s ON s."userId" = u.id
WHERE u."isActive" = true
ORDER BY u."createdAt";
