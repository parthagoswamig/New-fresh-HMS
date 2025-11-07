# 🚨 Database Connection Blocked - Use This Instead

## Problem
Your local machine cannot connect directly to Supabase (firewall/network restriction).

## ✅ Solution: Run Migration in Supabase SQL Editor

### Step 1: Open Supabase SQL Editor
Click this link: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new

### Step 2: Copy the Migration SQL
Open the file: `apps/backend/init-migration.sql`

**OR** use this quick command to view it:
```bash
cd apps/backend
type init-migration.sql
```

### Step 3: Run in Supabase
1. Copy ALL the SQL from `init-migration.sql`
2. Paste into the SQL Editor
3. Click "Run" (green play button)
4. Wait for "Success" message

### Step 4: Verify Tables Created
1. Go to: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/editor
2. You should see all these tables:
   - tenants
   - users
   - patients
   - staff
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

### Step 5: Update Prisma
After running the migration in Supabase, tell Prisma about it:

```bash
cd apps/backend
npx prisma db pull
npx prisma generate
```

### Step 6: Start Your Backend
```bash
npm run dev
```

---

## ✅ Your Backend Should Now Start Successfully!

The backend will connect to Supabase (read/write) even though migrations must be run via SQL Editor.

---

## 🔧 Alternative: Use Supabase Connection String

If you want to try connecting directly, you might need to:

1. **Check Supabase Network Settings**:
   - Go to: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/settings/database
   - Check "Connection Pooling" settings
   - Ensure IPv4 is enabled

2. **Try Different Port**:
   Update `.env`:
   ```env
   DATABASE_URL="postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

3. **Check Firewall**:
   - Your network/firewall might be blocking port 5432
   - Try from a different network
   - Use VPN if available

---

## 📝 Quick Reference

**Supabase SQL Editor**: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new

**Migration File**: `apps/backend/init-migration.sql`

**After Migration**:
```bash
cd apps/backend
npx prisma generate
npm run dev
```

**Frontend** (in new terminal):
```bash
cd apps/frontend  
npm run dev
```

---

**Once migration is done, your app will work perfectly! 🚀**
