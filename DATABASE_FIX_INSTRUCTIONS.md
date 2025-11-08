# 🔧 Database Fix Instructions - HMS SaaS

## 🚨 Current Issues

### OPD Module Error:
```
PrismaClientKnownRequestError: The column `opd_visits.fee` does not exist in the current database.
```

**Root Cause:** The Prisma schema has the `fee` field, but the database table doesn't have this column.

---

## ✅ Solution - Run SQL Migration

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run the Complete Fix

Copy and paste the contents of **`COMPLETE_DATABASE_FIX.sql`** and click **Run**.

This will:
- ✅ Add `fee` column to `opd_visits` table
- ✅ Add `insuranceCovered` column to `bills` table
- ✅ Add `finalized` column to `bills` table
- ✅ Add `discount` column to `bill_items` table
- ✅ Set default values for all existing records
- ✅ Run verification queries to confirm success

### Step 3: Verify Migration Success

After running the migration, you should see output showing:
- Column definitions for all new fields
- Count of records with NULL values (should be 0)

---

## 🔄 Alternative: Run Individual Fixes

If you prefer to fix modules separately:

### Fix OPD Only:
```sql
-- Run contents of OPD_FIX_MIGRATION.sql
ALTER TABLE opd_visits ADD COLUMN IF NOT EXISTS "fee" DOUBLE PRECISION NOT NULL DEFAULT 0;
UPDATE opd_visits SET "fee" = 0 WHERE "fee" IS NULL;
```

### Fix Billing Only:
```sql
-- Run contents of BILLING_MIGRATION.sql
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "insuranceCovered" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "finalized" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

UPDATE bills SET "insuranceCovered" = 0 WHERE "insuranceCovered" IS NULL;
UPDATE bills SET "finalized" = false WHERE "finalized" IS NULL;
UPDATE bill_items SET "discount" = 0 WHERE "discount" IS NULL;
```

---

## 🚀 After Migration

### 1. No Code Changes Needed
Your backend code is already correct and matches the schema. The issue was only in the database.

### 2. Redeploy (Optional)
If you want to regenerate Prisma client:
```bash
# This will happen automatically on next Vercel deployment
# Or manually:
cd apps/backend
npx prisma generate
```

### 3. Test the Endpoints

**Test OPD:**
```bash
GET /opd
GET /opd/stats
```

**Test Billing:**
```bash
GET /billing
POST /billing/:id/payment
PATCH /billing/:id/finalize
```

---

## 📊 What Each Column Does

### OPD Module:
- **`fee`** (Float, default: 0) - Consultation fee for the OPD visit

### Billing Module:
- **`insuranceCovered`** (Float, default: 0) - Amount covered by insurance
- **`finalized`** (Boolean, default: false) - Whether bill is locked from edits
- **`discount`** (Float, default: 0) - Per-item discount amount

---

## 🔍 Troubleshooting

### If OPD still shows errors after migration:

1. **Verify column exists:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'opd_visits' AND column_name = 'fee';
```

2. **Check Vercel deployment logs** - Ensure no build errors

3. **Clear Vercel cache** - Redeploy with fresh build

4. **Verify Prisma client regenerated** - Check deployment logs for "Prisma generate"

### If Billing shows errors:

1. **Verify columns exist:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bills' AND column_name IN ('insuranceCovered', 'finalized');

SELECT column_name FROM information_schema.columns 
WHERE table_name = 'bill_items' AND column_name = 'discount';
```

2. **Check for NULL values:**
```sql
SELECT COUNT(*) FROM bills WHERE "insuranceCovered" IS NULL OR finalized IS NULL;
SELECT COUNT(*) FROM bill_items WHERE discount IS NULL;
```

---

## ✅ Success Indicators

After running the migration, you should see:

1. ✅ OPD list loads without errors
2. ✅ OPD stats display correctly
3. ✅ Billing list loads without errors
4. ✅ Can create new OPD visits with fee
5. ✅ Can create bills with insurance and discounts
6. ✅ Can finalize bills
7. ✅ Can add payments to bills

---

## 📝 Summary

**Problem:** Database schema out of sync with Prisma schema
**Solution:** Run SQL migration to add missing columns
**Impact:** Zero downtime, backward compatible
**Risk:** None - all changes use `IF NOT EXISTS` and set safe defaults

**Estimated Time:** 2-3 minutes to run migration

---

## 🆘 Need Help?

If issues persist after migration:
1. Check Supabase logs for SQL errors
2. Verify migration ran successfully (check verification queries output)
3. Ensure Vercel deployment completed
4. Check browser console for frontend errors
5. Test API endpoints directly with Postman/Thunder Client

---

**Status: Ready to Execute ✅**

**Next Step: Run `COMPLETE_DATABASE_FIX.sql` in Supabase SQL Editor**
