# Vercel Frontend Setup - Complete Guide

## 🚨 CRITICAL: Environment Variables

Go to your **Frontend** Vercel project → Settings → Environment Variables and add:

### Required Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api-zeta-flax.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVveHl5cWJ3dXpqcmF4aGF5cGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NjUzNDMsImV4cCI6MjA3NTE0MTM0M30.ji2oHJykS6eFzkuMJssp8_zH83rjJyT11z2mw3NQLpw
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=CareStack HMS
```

## ⚠️ IMPORTANT: After Adding Environment Variables

1. Go to Vercel Dashboard
2. Click on your frontend project
3. Go to **Deployments** tab
4. Click the **three dots (...)** on the latest deployment
5. Click **Redeploy**
6. Select **Use existing Build Cache** (optional)
7. Click **Redeploy**

This ensures the new environment variables are used!

## 🔧 Backend CORS Configuration

Your backend is configured to accept requests from ANY origin (for development).

For production, you should restrict CORS in `apps/backend/api/index.ts`:

```typescript
app.enableCors({
  origin: ['https://web-sooty-pi-92.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
});
```

## 📋 Checklist

- [ ] Add `NEXT_PUBLIC_API_URL` to Vercel frontend environment variables
- [ ] Redeploy frontend after adding environment variables
- [ ] Test register page: `https://your-frontend.vercel.app/auth/register`
- [ ] Test login page: `https://your-frontend.vercel.app/auth/login`
- [ ] Check browser console for any errors

## 🧪 Testing

### 1. Open Browser DevTools (F12)
### 2. Go to Network tab
### 3. Try to register a user
### 4. Check the request:
   - URL should be: `https://api-zeta-flax.vercel.app/auth/register`
   - Method: POST
   - Status: 201 (Created) or 400 (Validation Error)
   - NO CORS errors!

## 🐛 Common Issues

### Issue: Still getting CORS error
**Solution:** 
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Redeploy frontend on Vercel

### Issue: "Network Error" or "Failed to fetch"
**Solution:**
1. Check if backend is running: `https://api-zeta-flax.vercel.app/health`
2. Verify `NEXT_PUBLIC_API_URL` is set correctly in Vercel
3. Check browser console for exact error

### Issue: 404 Not Found on API
**Solution:**
1. Verify backend deployment is successful
2. Check Vercel backend logs
3. Ensure all environment variables are set in backend

## 🎯 Expected Flow

1. User fills registration form
2. Frontend sends POST to `https://api-zeta-flax.vercel.app/auth/register`
3. Backend validates data
4. Backend creates tenant + user in Supabase
5. Backend returns JWT token + user data
6. Frontend stores token in Zustand
7. Frontend redirects to `/dashboard`

## 🔗 Important URLs

- **Frontend:** https://web-sooty-pi-92.vercel.app
- **Backend:** https://api-zeta-flax.vercel.app
- **Backend Health:** https://api-zeta-flax.vercel.app/health
- **API Docs:** https://api-zeta-flax.vercel.app/docs
