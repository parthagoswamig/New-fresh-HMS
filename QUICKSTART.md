# 🚀 HMS SaaS - Quick Start Guide

## 📁 Project Structure

```
hms-saas/
├── apps/
│   ├── backend/           # NestJS API (Port 3001)
│   │   ├── src/
│   │   │   ├── modules/   # All 15 modules
│   │   │   ├── common/    # Guards, decorators
│   │   │   ├── prisma/    # Database service
│   │   │   └── main.ts
│   │   └── prisma/
│   │       └── schema.prisma  # Complete DB schema
│   └── frontend/          # Next.js 14 (Port 3000)
│       └── src/
│           ├── app/       # Pages & routes
│           ├── components/
│           ├── lib/       # API client
│           └── store/     # Zustand state
└── README.md
```

## ⚡ Installation & Setup

### 1. Install Dependencies

```bash
# Root level
npm install

# Backend
cd apps/backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Setup Database (Supabase)

1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Settings > Database
4. Create `apps/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
SUPABASE_URL="https://[project].supabase.co"
SUPABASE_KEY="your-anon-key"
JWT_SECRET="change-this-to-random-string"
JWT_EXPIRES_IN="7d"
PORT=3001
```

### 3. Generate Prisma Client & Run Migrations

```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Setup Frontend Environment

Create `apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

## 🎯 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs (Swagger)**: http://localhost:3001/docs

## 🔑 First Steps

### 1. Create First Tenant

Use Swagger UI or cURL:

```bash
curl -X POST http://localhost:3001/tenants \
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

Save the returned `id` - this is your `tenantId`.

### 2. Register Admin User

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "your-tenant-id",
    "email": "admin@cityhospital.com",
    "password": "SecurePass123!",
    "role": "TENANT_ADMIN",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890"
  }'
```

### 3. Login

Visit http://localhost:3000/auth/login and use:
- **Tenant ID**: your-tenant-id
- **Email**: admin@cityhospital.com
- **Password**: SecurePass123!

## 📚 Available Modules

All modules have full CRUD APIs accessible via Swagger:

1. **Tenant Management** - `/tenants`
2. **Authentication** - `/auth`
3. **Users** - `/users`
4. **Patients** - `/patients`
5. **Staff** - `/staff`
6. **Departments** - `/departments`
7. **Appointments** - `/appointments`
8. **OPD** - `/opd`
9. **IPD** - `/ipd`
10. **Pharmacy** - `/pharmacy`
11. **Laboratory** - `/laboratory`
12. **Billing** - `/billing`
13. **Insurance** - `/insurance`
14. **HR** - `/hr`
15. **Settings** - `/settings`
16. **Reports** - `/reports`

## 🎭 User Roles

- **SUPER_ADMIN** - Full system access
- **TENANT_ADMIN** - Tenant-wide admin
- **HOSPITAL_ADMIN** - Hospital operations
- **DOCTOR** - Medical staff
- **NURSE** - Nursing staff
- **RECEPTIONIST** - Front desk
- **LAB_TECHNICIAN** - Laboratory
- **PHARMACIST** - Pharmacy
- **HR_MANAGER** - Human resources
- **ACCOUNTANT** - Finance
- **PATIENT** - Patient portal

## 🛠️ Development Tips

### View Database

```bash
cd apps/backend
npx prisma studio
```

### Reset Database

```bash
npx prisma migrate reset
```

### Generate New Migration

```bash
npx prisma migrate dev --name your_migration_name
```

### Check API Health

```bash
curl http://localhost:3001/docs
```

## 🐛 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify DATABASE_URL in .env
- Run `npx prisma generate`

### Frontend won't start
- Check if port 3000 is available
- Verify NEXT_PUBLIC_API_URL in .env.local
- Clear .next folder: `rm -rf .next`

### Database connection fails
- Verify Supabase credentials
- Check if IP is whitelisted in Supabase
- Test connection string

### Prisma errors
- Run `npx prisma generate`
- Delete node_modules and reinstall
- Check schema.prisma syntax

## 📖 Next Steps

1. **Implement Remaining Module Controllers** - Follow the template in `IMPLEMENTATION_GUIDE.md`
2. **Add Frontend Pages** - Create pages for each module
3. **Customize UI** - Update branding and styling
4. **Add Tests** - Write unit and integration tests
5. **Deploy** - Follow `DEPLOYMENT.md` for production deployment

## 📞 Support

For detailed implementation guides, see:
- `IMPLEMENTATION_GUIDE.md` - Module implementation patterns
- `DEPLOYMENT.md` - Production deployment guide
- `README.md` - Project overview

## ✅ Checklist

- [ ] Dependencies installed
- [ ] Database configured
- [ ] Prisma client generated
- [ ] Migrations run
- [ ] Backend running on :3001
- [ ] Frontend running on :3000
- [ ] First tenant created
- [ ] Admin user registered
- [ ] Successfully logged in
- [ ] Swagger docs accessible

---

**Built with**: Next.js 14, NestJS, Prisma, Supabase, TailwindCSS, Zustand
