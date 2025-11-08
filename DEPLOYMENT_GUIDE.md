# 🚀 Hospital Management System - Deployment Guide

## 📋 Prerequisites
- Vercel Account
- Supabase Account
- GitHub Repository

---

## 🔧 Backend Deployment (Vercel)

### 1. Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```env
# Database (Supabase Pooler)
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=10&connect_timeout=10

# Direct Database URL (for migrations)
DIRECT_DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Frontend URL (NO trailing slash!)
FRONTEND_URL=https://web-sooty-pi-92.vercel.app
CORS_ORIGINS=https://web-sooty-pi-92.vercel.app

# JWT Secrets
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==
JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Supabase
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE

# Environment
NODE_ENV=production
VERCEL=1
BCRYPT_SALT_ROUNDS=12
PORT=3001
```

### 2. Deployment Settings
- **Root Directory:** `apps/backend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

---

## 🌐 Frontend Deployment (Vercel)

### 1. Environment Variables

```env
# Backend API (NO trailing slash!)
NEXT_PUBLIC_API_URL=https://api-zeta-flax.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

# App Config
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=HMS SaaS
```

### 2. Deployment Settings
- **Root Directory:** `apps/frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 🗄️ Database Setup (Supabase)

### 1. Run Migrations

After backend is deployed, run migrations:

```bash
# Clone your repo locally
git clone <your-repo>
cd apps/backend

# Install dependencies
npm install

# Set environment variables
export DATABASE_URL="postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
export DIRECT_DATABASE_URL="postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 2. Seed Initial Data (Optional)

Create a super admin user directly in Supabase SQL Editor:

```sql
-- Insert initial tenant
INSERT INTO "tenants" (id, name, subdomain, "isActive", "createdAt", "updatedAt")
VALUES ('tenant-1', 'Demo Hospital', 'demo', true, NOW(), NOW());

-- Insert super admin user
INSERT INTO "users" (id, email, password, role, "firstName", "lastName", "isActive", "createdAt", "updatedAt")
VALUES ('user-1', 'admin@demo.com', '$2b$12$hashedpassword', 'SUPER_ADMIN', 'Super', 'Admin', true, NOW(), NOW());
```

---

## 🔍 Troubleshooting

### 500 Internal Server Error

**Common Causes:**

1. **Missing Environment Variables**
   - Check all required env vars are set in Vercel
   - No trailing slashes in URLs

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check Supabase pooler is enabled
   - Ensure DIRECT_DATABASE_URL is set

3. **CORS Issues**
   - Ensure CORS_ORIGINS matches frontend URL exactly
   - No trailing slash in CORS_ORIGINS

4. **Prisma Client Not Generated**
   - Redeploy backend after setting DIRECT_DATABASE_URL
   - Check build logs for Prisma errors

5. **Header Case Sensitivity**
   - Backend now supports both `x-tenant-id` and `X-Tenant-ID`

### Check Logs

```bash
# Vercel CLI
vercel logs <deployment-url>

# Or check in Vercel Dashboard → Deployments → Logs
```

---

## ✅ Verification Checklist

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully
- [ ] All environment variables set (no trailing slashes!)
- [ ] Database migrations run
- [ ] Can access Swagger docs: `https://api-zeta-flax.vercel.app/docs`
- [ ] Frontend loads without errors
- [ ] Can register/login
- [ ] Can create tenant
- [ ] All modules accessible

---

## 🔗 Important URLs

- **Frontend:** https://web-sooty-pi-92.vercel.app
- **Backend API:** https://api-zeta-flax.vercel.app
- **API Docs:** https://api-zeta-flax.vercel.app/docs
- **Supabase:** https://uoxyyqbwuzjraxhaypko.supabase.co

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify all environment variables
4. Ensure no trailing slashes in URLs
5. Check CORS settings

---

## 🎉 Success!

Once deployed:
1. Visit frontend URL
2. Register new account
3. Create tenant
4. Start using the system!
