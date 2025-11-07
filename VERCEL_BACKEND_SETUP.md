# Vercel Backend Setup - Complete Guide

## ✅ Current Status
- Backend builds successfully
- NestJS app starts correctly
- Issue: 401 Unauthorized on root route (FIXED)

## 🔧 Root Cause
The `JwtAuthGuard` is applied globally to ALL routes, but the root `/` and `/health` endpoints were missing the `@Public()` decorator.

## 📋 Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### Database
```
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20
```

### Supabase
```
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU2NTM0MywiZXhwIjoyMDc1MTQxMzQzfQ.17ZYMGLqzcntTgpQwm1YzCT6eE8OGkGUCOONBgPC9DE
```

### JWT
```
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==
JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
```

### CORS
```
CORS_ORIGINS=https://hma-sass-web.vercel.app,http://localhost:3000
FRONTEND_URL=https://hma-sass-web.vercel.app
```

### App Config
```
NODE_ENV=production
PORT=3001
BCRYPT_SALT_ROUNDS=12
```

## 🎯 Expected API Endpoints

After deployment, these endpoints should work:

### 1. Root (Health Check)
```bash
GET https://your-api.vercel.app/
```
**Response:**
```json
{
  "status": "ok",
  "message": "CareStack API is running",
  "timestamp": "2024-11-07T...",
  "endpoints": {
    "docs": "/docs",
    "auth": "/auth",
    "tenants": "/tenants"
  }
}
```

### 2. Health Check
```bash
GET https://your-api.vercel.app/health
```
**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2024-11-07T..."
}
```

### 3. Swagger Documentation
```bash
GET https://your-api.vercel.app/docs
```
Interactive API documentation

### 4. Register User
```bash
POST https://your-api.vercel.app/auth/register
Content-Type: application/json

{
  "tenantName": "Test Hospital",
  "subdomain": "test-hospital",
  "tenantEmail": "admin@test.com",
  "tenantPhone": "+1234567890",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@test.com",
  "phone": "+1234567890",
  "password": "Password123!",
  "role": "SUPER_ADMIN"
}
```

### 5. Login
```bash
POST https://your-api.vercel.app/auth/login
Content-Type: application/json

{
  "tenantId": "tenant-id-here",
  "email": "john@test.com",
  "password": "Password123!"
}
```

### 6. Get Tenants (Protected - needs JWT)
```bash
GET https://your-api.vercel.app/tenants
Authorization: Bearer <your-jwt-token>
```

## 🔍 Troubleshooting

### If you get 401 Unauthorized:
- Check if the endpoint has `@Public()` decorator
- Verify JWT_SECRET is set in Vercel environment variables

### If you get 500 Internal Server Error:
- Check Vercel logs for detailed error
- Verify DATABASE_URL is correct
- Ensure Prisma client is generated during build

### If you get CORS errors:
- Add your frontend URL to CORS_ORIGINS
- Check if CORS middleware is enabled in main.ts

## 📁 File Structure

```
apps/backend/
├── api/
│   ├── index.ts          ← Vercel serverless entry point
│   └── tsconfig.json
├── src/
│   ├── app.controller.ts ← Root & health endpoints (PUBLIC)
│   ├── app.module.ts
│   ├── main.ts           ← Local development
│   ├── common/
│   │   ├── decorators/
│   │   │   └── public.decorator.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   └── modules/
│       ├── auth/         ← Login/Register (PUBLIC)
│       ├── tenant/       ← Protected
│       └── ...
├── prisma/
│   └── schema.prisma
├── package.json
└── vercel.json
```

## ✅ Checklist Before Deployment

- [ ] All environment variables added to Vercel
- [ ] Database tables created in Supabase (run migration SQL)
- [ ] `@Public()` decorator on public endpoints
- [ ] CORS origins include your frontend URL
- [ ] JWT secrets are strong and secure
- [ ] Prisma schema matches database

## 🚀 Deploy Command

```bash
git add .
git commit -m "fix: Add @Public decorator to root endpoints"
git push origin main
```

Vercel will auto-deploy. Check logs at: https://vercel.com/dashboard
