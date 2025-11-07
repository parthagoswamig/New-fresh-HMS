# 🚀 Setup Instructions

## ⚠️ IMPORTANT: Database Configuration Required

I've created the `.env` files, but you need to configure your database connection.

## Option 1: Use Supabase (Recommended for Production)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up / Login
3. Click "New Project"
4. Choose organization and set:
   - **Project Name**: hms-saas (or your choice)
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to you
5. Wait for project to be created (~2 minutes)

### Step 2: Get Connection String
1. In your Supabase project, go to **Settings** → **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Update .env File
Open `apps/backend/.env` and update:
```env
DATABASE_URL="your-copied-connection-string-here"
SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_KEY="your-anon-public-key"
```

Get `SUPABASE_KEY` from: **Settings** → **API** → **Project API keys** → Copy `anon` `public` key

### Step 4: Run Migration
```bash
cd apps/backend
npx prisma migrate dev --name init
```

---

## Option 2: Use Local PostgreSQL (For Development)

### Step 1: Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### Step 2: Create Database
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE hms_saas;

# Exit
\q
```

### Step 3: Update .env File
Open `apps/backend/.env` and update:
```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/hms_saas?schema=public"
```
Replace `your-password` with your PostgreSQL password.

### Step 4: Run Migration
```bash
cd apps/backend
npx prisma migrate dev --name init
```

---

## After Database Setup

### 1. Start Backend
```bash
cd apps/backend
npm run dev
```
Backend will run on: http://localhost:3001

### 2. Start Frontend (New Terminal)
```bash
cd apps/frontend
npm run dev
```
Frontend will run on: http://localhost:3000

### 3. Access Swagger API Docs
http://localhost:3001/docs

---

## Quick Test

Once both servers are running:

1. Visit http://localhost:3000
2. You should see the HMS SaaS landing page
3. Click "Login" or "Register"

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `apps/backend/`
- Check that `DATABASE_URL` is properly set

### "Can't reach database server"
- **Supabase**: Check your connection string and password
- **Local**: Make sure PostgreSQL is running
- **Firewall**: Check if port 5432 is accessible

### Migration fails
- Verify database exists
- Check database user has proper permissions
- Try: `npx prisma migrate reset` (WARNING: deletes all data)

---

## Next Steps After Setup

1. **Create First Tenant** (via Swagger or API):
   ```bash
   POST http://localhost:3001/tenants
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

2. **Register Admin User**:
   ```bash
   POST http://localhost:3001/auth/register
   {
     "tenantId": "tenant-id-from-step-1",
     "email": "admin@cityhospital.com",
     "password": "SecurePass123!",
     "role": "TENANT_ADMIN",
     "firstName": "John",
     "lastName": "Doe",
     "phone": "+1234567890"
   }
   ```

3. **Login** at http://localhost:3000/auth/login

---

## 📝 Files Created

✅ `apps/backend/.env` - Backend environment variables
✅ `apps/frontend/.env.local` - Frontend environment variables

## 🔐 Security Notes

- Change `JWT_SECRET` to a random string in production
- Never commit `.env` files to git (already in .gitignore)
- Use strong passwords for database and admin users
- Enable SSL for production database connections

---

**Need Help?** Check `QUICKSTART.md` and `README.md` for more details.
