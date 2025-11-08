-- ==========================================
-- OPD MODULE FIX - Add missing columns
-- ==========================================

-- Add fee column to opd_visits table if it doesn't exist
ALTER TABLE opd_visits ADD COLUMN IF NOT EXISTS "fee" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing records to set default fee
UPDATE opd_visits SET "fee" = 0 WHERE "fee" IS NULL;

-- Verify the column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'opd_visits' AND column_name = 'fee';
