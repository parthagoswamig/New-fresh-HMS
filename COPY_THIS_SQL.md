# 📋 Copy This SQL to Supabase

## Step 1: Open Supabase SQL Editor
**Click here:** https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new

## Step 2: Copy the SQL
The SQL is in the file: **`apps/backend/migration-for-supabase.sql`**

To view it, run:
```bash
cd apps/backend
type migration-for-supabase.sql
```

Or open the file in your editor and copy all contents.

## Step 3: Paste & Run in Supabase
1. Paste ALL the SQL into Supabase SQL Editor
2. Click the green "Run" button
3. Wait for "Success" message

## Step 4: After Migration Succeeds
```bash
cd apps/backend
npx prisma generate
npm run dev
```

---

## ✅ Your backend will then start successfully!

The SQL file contains all the CREATE TABLE statements for:
- tenants
- users
- staff
- patients
- departments
- appointments
- opd_visits
- ipd_admissions
- wards
- beds
- prescriptions
- prescription_items
- medicines
- lab_tests
- lab_orders
- bills
- bill_items
- payments
- insurances
- claims
- attendances
- settings

Plus all the foreign key relationships and indexes.
