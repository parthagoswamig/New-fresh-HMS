# Hospital Management SaaS (HMS SaaS)

A comprehensive, multi-tenant Hospital Management System built with modern serverless architecture.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TailwindCSS + Zustand + TanStack Table
- **Backend**: NestJS + Prisma ORM
- **Database**: Supabase PostgreSQL (multi-tenant via tenantId)
- **Auth**: JWT-based with RBAC
- **Deployment**: Vercel (Serverless) + Supabase
- **Monorepo**: Turborepo

## 📦 Project Structure

```
hms-saas/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js 14 App
├── packages/
│   ├── shared/           # Shared types & utilities
│   └── ui/               # Shared UI components
└── turbo.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Generate Prisma client
cd apps/backend
npx prisma generate
npx prisma migrate dev

# Run development servers
cd ../..
npm run dev
```

### Environment Variables

**Backend (.env)**
```
DATABASE_URL="postgresql://..."
SUPABASE_URL="https://..."
SUPABASE_KEY="..."
JWT_SECRET="your-secret-key"
PORT=3001
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 👥 User Roles

- SUPER_ADMIN
- TENANT_ADMIN
- HOSPITAL_ADMIN
- DOCTOR
- NURSE
- RECEPTIONIST
- LAB_TECHNICIAN
- PHARMACIST
- HR_MANAGER
- ACCOUNTANT
- PATIENT

## 📋 Core Modules

1. Tenant Management
2. Authentication & Authorization
3. User Management
4. Patient Management
5. Staff Management
6. Appointment Scheduling
7. OPD (Outpatient)
8. IPD (Inpatient)
9. Pharmacy
10. Laboratory & Radiology
11. Billing & Finance
12. Insurance
13. HR & Payroll
14. Settings
15. Reports & Analytics

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Tenant isolation middleware
- Request validation with DTOs
- SQL injection prevention via Prisma

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:3001/docs`

## 🚢 Deployment

### Backend (Vercel)
```bash
cd apps/backend
vercel
```

### Frontend (Vercel)
```bash
cd apps/frontend
vercel
```

## 📄 License

MIT
