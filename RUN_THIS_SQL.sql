-- ==========================================
-- QUICK FIX: Create Staff Records
-- ==========================================
-- Copy and paste this entire script into Vercel Postgres Query tab
-- ==========================================

-- Create staff records for all users who don't have one
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
AND u."isActive" = true;

-- Verify: Check if staff records were created
SELECT 
  u.email,
  u."firstName",
  u."lastName",
  u.role,
  s.id as staff_id,
  s."employeeId"
FROM users u
LEFT JOIN staff s ON s."userId" = u.id
WHERE u."isActive" = true
ORDER BY u."createdAt";

-- Expected: Every user should now have a staff_id (not NULL)
