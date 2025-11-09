# 🚀 SUPABASE + VERCEL DEPLOYMENT GUIDE

## 📋 **MODULES CREATED & SQL MIGRATIONS NEEDED**

I've created **2 major modules** for you:

### **1. Surgery Module** 🏥
- Operating Rooms Management
- Surgery Scheduling
- Surgeon Assignment
- Status Tracking (Scheduled → In Progress → Completed)
- Billing Integration

### **2. Emergency Module** 🚨
- Emergency Triage
- Quick Patient Registration
- Severity Levels (Critical, Serious, Moderate, Stable)
- Vital Signs Tracking
- Discharge/Death Management
- IPD Transfer Integration

---

## 🗄️ **STEP 1: RUN SQL MIGRATIONS IN SUPABASE**

### **For Surgery & Emergency Modules:**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Select your project

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste the Migration**
   - Open the file: `EMERGENCY_SURGERY_MIGRATION.sql`
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or press Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

5. **Verify Success**
   - You should see: "Success. No rows returned"
   - Check the verification queries at the bottom

### **What This Creates:**

#### **Surgery Module Tables:**
- ✅ `operating_rooms` - Operating theater management
- ✅ `surgeries` - Surgery records with full details
- ✅ Enums: `SurgeryStatus`, `SurgeryType`

#### **Emergency Module Tables:**
- ✅ `emergency_cases` - Emergency patient records
- ✅ Enums: `EmergencySeverity`, `EmergencyStatus`, `ArrivalMode`

#### **Security Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Tenant isolation policies
- ✅ Auto-update timestamps
- ✅ Performance indexes

---

## 🔧 **STEP 2: UPDATE ENVIRONMENT VARIABLES**

### **Backend (.env in apps/backend):**

```env
# Database
DATABASE_URL="your-supabase-postgres-connection-string"

# Get this from Supabase Dashboard → Settings → Database → Connection String
# Format: postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# JWT Secret (from Supabase Dashboard → Settings → API)
JWT_SECRET="your-supabase-jwt-secret"

# Other configs
PORT=3001
NODE_ENV=production
```

### **Frontend (.env.local in apps/frontend):**

```env
# Backend API URL (will be your Vercel backend URL after deployment)
NEXT_PUBLIC_API_URL="https://your-backend.vercel.app"

# Or for local development:
# NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

## 🚀 **STEP 3: DEPLOY TO VERCEL**

### **A. Deploy Backend (NestJS)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add Surgery and Emergency modules"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the **backend** folder as root directory

3. **Configure Build Settings**
   - **Framework Preset:** Other
   - **Root Directory:** `apps/backend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. **Add Environment Variables**
   - Add all variables from your `.env` file
   - Make sure to add `DATABASE_URL` with your Supabase connection string

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Copy the deployment URL (e.g., `https://your-backend.vercel.app`)

### **B. Deploy Frontend (Next.js)**

1. **Import to Vercel**
   - Click "Add New" → "Project"
   - Import the same repository
   - Select the **frontend** folder as root directory

2. **Configure Build Settings**
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

3. **Add Environment Variables**
   - `NEXT_PUBLIC_API_URL` = Your backend Vercel URL from step A

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is now live!

---

## 🔄 **STEP 4: GENERATE PRISMA CLIENT ON VERCEL**

Since you're using Prisma with Supabase, you need to ensure Prisma Client is generated during deployment.

### **Update package.json (in apps/backend):**

```json
{
  "scripts": {
    "build": "prisma generate && nest build",
    "postinstall": "prisma generate"
  }
}
```

This ensures Prisma Client is generated:
1. During build
2. After npm install

---

## ✅ **STEP 5: VERIFY DEPLOYMENT**

### **Test Backend:**
```bash
# Check health endpoint
curl https://your-backend.vercel.app/health

# Test emergency endpoint
curl https://your-backend.vercel.app/emergency/stats \
  -H "x-tenant-id: your-tenant-id"
```

### **Test Frontend:**
1. Open your Vercel frontend URL
2. Login to the system
3. Navigate to:
   - `/dashboard/surgery` - Surgery module
   - `/dashboard/emergency` - Emergency module

---

## 🎯 **QUICK CHECKLIST**

- [ ] Run `EMERGENCY_SURGERY_MIGRATION.sql` in Supabase SQL Editor
- [ ] Verify tables created in Supabase Table Editor
- [ ] Update `DATABASE_URL` in backend environment variables
- [ ] Push code to GitHub
- [ ] Deploy backend to Vercel
- [ ] Copy backend URL
- [ ] Deploy frontend to Vercel with backend URL
- [ ] Test both modules in production

---

## 🐛 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: Prisma Client Not Generated**
**Solution:** Add `"postinstall": "prisma generate"` to package.json scripts

### **Issue 2: Database Connection Failed**
**Solution:** 
- Check `DATABASE_URL` format
- Ensure Supabase project is not paused
- Verify connection string includes password

### **Issue 3: CORS Errors**
**Solution:** Update backend CORS configuration to allow your frontend domain

### **Issue 4: RLS Policies Blocking Queries**
**Solution:** 
- Ensure you're setting `app.current_tenant_id` in your queries
- Or temporarily disable RLS for testing: `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`

### **Issue 5: Build Fails on Vercel**
**Solution:**
- Check build logs
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors locally first

---

## 📊 **WHAT YOU GET**

### **Surgery Module:**
- ✅ Operating room management
- ✅ Surgery scheduling with conflict detection
- ✅ Auto-generated surgery numbers (SUR-YYYYMM-0001)
- ✅ Status workflow management
- ✅ Surgeon and anesthesiologist assignment
- ✅ Pre-op and post-op notes
- ✅ Billing integration
- ✅ Analytics dashboard
- ✅ Printable surgery reports

### **Emergency Module:**
- ✅ Emergency triage system
- ✅ Quick patient registration
- ✅ Severity-based prioritization
- ✅ Vital signs tracking
- ✅ Auto-generated emergency numbers (EMR-YYYYMM-0001)
- ✅ Status workflow (Waiting → Treatment → Discharge)
- ✅ Death declaration
- ✅ IPD transfer integration
- ✅ Analytics with mortality tracking
- ✅ Printable emergency reports

---

## 🎉 **YOU'RE ALL SET!**

Your Surgery and Emergency modules are now:
- ✅ Database schema created in Supabase
- ✅ Backend API deployed on Vercel
- ✅ Frontend UI deployed on Vercel
- ✅ Fully functional and production-ready

**Access your modules at:**
- Surgery: `https://your-frontend.vercel.app/dashboard/surgery`
- Emergency: `https://your-frontend.vercel.app/dashboard/emergency`

---

## 📞 **NEED HELP?**

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables are set correctly
4. Test locally first with `npm run dev`

**Happy Deploying! 🚀**
