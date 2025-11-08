-- Add new fields to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "insuranceCovered" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "finalized" BOOLEAN NOT NULL DEFAULT false;

-- Add discount field to bill_items table
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing records to set defaults
UPDATE bills SET "insuranceCovered" = 0 WHERE "insuranceCovered" IS NULL;
UPDATE bills SET "finalized" = false WHERE "finalized" IS NULL;
UPDATE bill_items SET "discount" = 0 WHERE "discount" IS NULL;
