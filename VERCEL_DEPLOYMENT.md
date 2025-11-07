# 🚀 Vercel Deployment Guide

## ✅ Environment Variables Already Configured

Your `.env` files are now set up with production Vercel credentials!

---

## 📋 Deployment Steps

### 1. Run Database Migration

Since your local machine might not connect to Supabase directly, run the migration from Vercel:

#### Option A: Deploy First, Then Migrate

```bash
# Deploy backend to Vercel
cd apps/backend
vercel --prod

# After deployment, run migration via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

#### Option B: Use Supabase SQL Editor

1. Go to your Supabase project: https://uoxyyqbwuzjraxhaypko.supabase.co
2. Navigate to **SQL Editor**
3. Run the migration SQL manually (I'll generate this for you)

### 2. Generate Migration SQL

```bash
# Generate the SQL without applying
cd apps/backend
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > migration.sql
```

Then copy the contents of `migration.sql` and run it in Supabase SQL Editor.

---

## 🔧 Vercel Environment Variables Setup

### Backend (hma-saas-api.vercel.app)

Go to your Vercel backend project → Settings → Environment Variables and add:

```
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20&pool_timeout=10&connect_timeout=10

DIRECT_DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE

JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==

JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=

JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=

JWT_ACCESS_EXPIRATION=15m

JWT_REFRESH_EXPIRATION=7d

FRONTEND_URL=https://hma-sass-web.vercel.app

CORS_ORIGINS=https://hma-sass-web.vercel.app

NODE_ENV=production

VERCEL=1

BCRYPT_SALT_ROUNDS=12
```

### Frontend (hma-sass-web.vercel.app)

Go to your Vercel frontend project → Settings → Environment Variables and add:

```
NEXT_PUBLIC_API_URL=https://hma-saas-api.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw

NEXT_PUBLIC_APP_ENV=production

NEXT_PUBLIC_APP_NAME=HMS SaaS
```

---

## 📦 Deploy Commands

### Backend
```bash
cd apps/backend
vercel --prod
```

### Frontend
```bash
cd apps/frontend
vercel --prod
```

---

## 🗄️ Database Migration via Supabase SQL Editor

Since direct connection might be blocked, use Supabase SQL Editor:

1. **Generate Migration SQL**:
```bash
cd apps/backend
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > init.sql
```

2. **Open Supabase SQL Editor**:
   - Go to: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql
   - Create new query

3. **Run the Migration**:
   - Copy contents from `init.sql`
   - Paste into SQL Editor
   - Click "Run"

4. **Verify Tables Created**:
   - Go to Table Editor
   - You should see all your tables (tenants, users, patients, etc.)

---

## ✅ Post-Deployment Checklist

- [ ] Backend deployed to Vercel
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set in both projects
- [ ] Database migration completed
- [ ] Backend API accessible: https://hma-saas-api.vercel.app/docs
- [ ] Frontend accessible: https://hma-sass-web.vercel.app
- [ ] CORS configured correctly
- [ ] Test login/register flow

---

## 🧪 Testing Deployment

### 1. Test Backend API
```bash
curl https://hma-saas-api.vercel.app/docs
```

### 2. Create First Tenant
```bash
curl -X POST https://hma-saas-api.vercel.app/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City Hospital",
    "subdomain": "city-hospital",
    "email": "admin@cityhospital.com",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  }'
```

### 3. Register Admin User
```bash
curl -X POST https://hma-saas-api.vercel.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "TENANT_ID_FROM_STEP_2",
    "email": "admin@cityhospital.com",
    "password": "SecurePass123!",
    "role": "TENANT_ADMIN",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### 4. Test Frontend
Visit: https://hma-sass-web.vercel.app

---

## 🔧 Troubleshooting

### CORS Errors
- Check `CORS_ORIGINS` in backend env vars
- Ensure frontend URL matches exactly (with/without trailing slash)

### Database Connection Issues
- Verify `DATABASE_URL` and `DIRECT_DATABASE_URL` are correct
- Check Supabase project is active
- Ensure connection pooling is enabled

### Migration Fails
- Use Supabase SQL Editor method
- Check database user permissions
- Verify schema syntax

### 404 on API Routes
- Check vercel.json configuration
- Ensure build completed successfully
- Check Vercel deployment logs

---

## 📊 Monitoring

- **Backend Logs**: Vercel Dashboard → hma-saas-api → Logs
- **Frontend Logs**: Vercel Dashboard → hma-sass-web → Logs
- **Database**: Supabase Dashboard → Database → Logs
- **API Performance**: Supabase Dashboard → API

---

## 🎉 You're Live!

Once deployed:
- **Frontend**: https://hma-sass-web.vercel.app
- **Backend API**: https://hma-saas-api.vercel.app
- **API Docs**: https://hma-saas-api.vercel.app/docs
- **Database**: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko
