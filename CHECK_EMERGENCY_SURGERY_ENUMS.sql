-- =====================================================
-- CHECK IF EMERGENCY & SURGERY ENUMS EXIST IN SUPABASE
-- Run this query to verify if migration is needed
-- =====================================================

SELECT 
  typname as enum_name,
  'EXISTS' as status
FROM pg_type 
WHERE typname IN (
  'SurgeryStatus',
  'SurgeryType',
  'EmergencySeverity',
  'EmergencyStatus',
  'ArrivalMode'
)
ORDER BY typname;

-- Expected Result (if migration already run):
-- Should return 5 rows with all enum names
-- 
-- If you get 0 rows, you need to run EMERGENCY_SURGERY_MIGRATION.sql
