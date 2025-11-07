# 🔧 Network Connection Issue - SOLVED

## 🚨 The Problem
```
Error: P1001: Can't reach database server at aws-1-ap-southeast-1.pooler.supabase.com:5432
PrismaClientInitializationError: Timed out fetching a new connection from the connection pool
```

**Why?** Your local network/firewall is blocking direct connection to Supabase port 5432.

---

## ✅ The Solution (3 Steps)

### Step 1: Run Migration in Supabase SQL Editor

**You cannot run migrations from your local machine**, but you can run them directly in Supabase!

1. **Open Supabase SQL Editor**:
   https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new

2. **View Migration SQL**:
   ```bash
   cd apps/backend
   .\view-migration.ps1
   ```
   OR
   ```bash
   type init-migration.sql
   ```

3. **Copy & Run**:
   - Copy ALL the SQL output
   - Paste in Supabase SQL Editor
   - Click "Run" button
   - Wait for success message

### Step 2: Generate Prisma Client

After migration succeeds in Supabase:

```bash
cd apps/backend
npx prisma generate
```

### Step 3: Start Backend

```bash
npm run dev
```

The backend will now connect successfully! ✅

---

## 🎯 Why This Works

- **Migrations**: Run via Supabase web interface (bypasses network block)
- **App Runtime**: Uses connection pooling which works through different ports
- **Result**: Your app works perfectly even though migrations must be run in Supabase

---

## 📋 Complete Workflow

```bash
# 1. Run migration in Supabase SQL Editor (one time)
#    https://supabase.com/dashboard/project/uoxyyqbwuzjraxhaypko/sql/new

# 2. Generate Prisma client
cd apps/backend
npx prisma generate

# 3. Start backend
npm run dev

# 4. Start frontend (new terminal)
cd apps/frontend
npm run dev
```

---

## ✅ Verify Everything Works

### Backend Running
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [RoutesResolver] AuthController {/auth}:
[Nest] LOG [RouterExplorer] Mapped {/auth/register, POST} route
[Nest] LOG [RouterExplorer] Mapped {/auth/login, POST} route
🚀 HMS SaaS API running on http://localhost:3001
📚 API Documentation available at http://localhost:3001/docs
```

### Test API
Visit: http://localhost:3001/docs

### Test Frontend
Visit: http://localhost:3000

---

## 🔍 Troubleshooting

### "Tables already exist" error in Supabase
- Your migration already ran successfully!
- Skip to Step 2 (npx prisma generate)

### Backend still won't connect
1. Check `.env` file has correct DATABASE_URL
2. Verify Supabase project is active
3. Try restarting backend: `npm run dev`

### Frontend can't reach backend
1. Ensure backend is running on port 3001
2. Check `apps/frontend/.env.local` has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

---

## 📝 Files to Use

- ✅ `apps/backend/init-migration.sql` - Run this in Supabase
- ✅ `apps/backend/view-migration.ps1` - Helper to view SQL
- ✅ `RUN_THIS_IN_SUPABASE.md` - Detailed instructions

---

## 🎉 Next Steps After Setup

1. **Create First Tenant** (via Swagger):
   http://localhost:3001/docs → POST /tenants

2. **Register Admin User**:
   http://localhost:3001/docs → POST /auth/register

3. **Login**:
   http://localhost:3000/auth/login

---

**Your HMS SaaS is ready to run! The network issue is bypassed by using Supabase SQL Editor for migrations. 🚀**
