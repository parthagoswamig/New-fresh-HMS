# Deployment Guide

## Prerequisites

- Node.js >= 18
- npm >= 9
- Supabase account
- Vercel account

## Database Setup (Supabase)

1. Create a new Supabase project at https://supabase.com
2. Copy the connection string from Settings > Database
3. Update `DATABASE_URL` in your `.env` files

## Backend Deployment (Vercel)

### Step 1: Prepare Backend

```bash
cd apps/backend
npm install
npx prisma generate
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Step 3: Set Environment Variables in Vercel

Go to your Vercel project settings and add:

```
DATABASE_URL=your-supabase-connection-string
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
NODE_ENV=production
```

### Step 4: Run Migrations

```bash
# From your local machine
npx prisma migrate deploy
```

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

```bash
cd apps/frontend
npm install
```

### Step 2: Deploy to Vercel

```bash
vercel --prod
```

### Step 3: Set Environment Variables

```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

## Post-Deployment

1. **Test the API**: Visit `https://your-backend-url.vercel.app/docs` for Swagger documentation
2. **Test the Frontend**: Visit your frontend URL
3. **Create First Tenant**: Use the API to create your first tenant
4. **Register Admin User**: Register the first admin user for your tenant

## Continuous Deployment

Both frontend and backend will auto-deploy on git push if connected to your repository.

## Monitoring

- **Backend Logs**: Check Vercel dashboard for backend logs
- **Frontend Logs**: Check Vercel dashboard for frontend logs
- **Database**: Monitor Supabase dashboard for database metrics

## Troubleshooting

### Issue: Prisma Client not generated
**Solution**: Run `npx prisma generate` before deployment

### Issue: Database connection fails
**Solution**: Check DATABASE_URL format and Supabase IP allowlist

### Issue: CORS errors
**Solution**: Update CORS settings in `main.ts` to include your frontend URL

### Issue: JWT errors
**Solution**: Ensure JWT_SECRET is set in environment variables
