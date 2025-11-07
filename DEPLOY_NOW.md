# ⚡ Deploy NOW - Quick Reference

## 🎯 3-Step Deployment

### 1️⃣ Run Migration in Supabase

```
1. Open: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql
2. Click "New Query"
3. Open file: apps/backend/init-migration.sql
4. Copy ALL contents
5. Paste in SQL Editor
6. Click "Run" (green button)
7. Wait for "Success" message
```

### 2️⃣ Deploy Backend

```bash
cd apps/backend
vercel --prod
```

### 3️⃣ Deploy Frontend

```bash
cd apps/frontend
vercel --prod
```

---

## ✅ Verify Deployment

1. **Backend API**: https://hma-saas-api.vercel.app/docs
2. **Frontend**: https://hma-sass-web.vercel.app

---

## 🎉 Create First User

### Via Swagger (Easiest)

1. Go to: https://hma-saas-api.vercel.app/docs
2. Expand `POST /tenants`
3. Click "Try it out"
4. Use this JSON:
```json
{
  "name": "City Hospital",
  "subdomain": "city-hospital",
  "email": "admin@cityhospital.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zipCode": "10001"
}
```
5. Click "Execute"
6. Copy the `id` from response

7. Expand `POST /auth/register`
8. Click "Try it out"
9. Use this JSON (replace TENANT_ID):
```json
{
  "tenantId": "PASTE_TENANT_ID_HERE",
  "email": "admin@cityhospital.com",
  "password": "SecurePass123!",
  "role": "TENANT_ADMIN",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```
10. Click "Execute"

### Login

1. Visit: https://hma-sass-web.vercel.app/auth/login
2. Enter:
   - Tenant ID: (from step 6)
   - Email: admin@cityhospital.com
   - Password: SecurePass123!
3. Click "Sign In"

---

## 🚨 Troubleshooting

### Migration Fails
- Check you copied ALL SQL (file is ~500 lines)
- Run in Supabase SQL Editor, not local terminal
- Check Supabase project is active

### Backend Deploy Fails
- Ensure environment variables are set in Vercel
- Check build logs in Vercel dashboard
- Verify `vercel.json` exists

### Frontend Deploy Fails
- Check `NEXT_PUBLIC_API_URL` is set
- Verify build completes successfully
- Check Vercel deployment logs

### CORS Errors
- Ensure `CORS_ORIGINS` matches frontend URL exactly
- No trailing slash in URLs
- Redeploy backend after fixing

---

## 📞 Quick Links

- **Supabase SQL**: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql
- **Supabase Tables**: https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/editor
- **Backend API**: https://hma-saas-api.vercel.app/docs
- **Frontend**: https://hma-sass-web.vercel.app

---

## 📋 Files You Need

- ✅ `apps/backend/init-migration.sql` - Run this in Supabase
- ✅ `apps/backend/.env` - Already configured
- ✅ `apps/frontend/.env.local` - Already configured

---

**That's it! Your HMS SaaS is ready to go live! 🚀**
