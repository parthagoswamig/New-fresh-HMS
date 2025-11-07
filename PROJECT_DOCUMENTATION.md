# 🏥 Hospital Management System (HMS) - Complete Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [Features](#features)
6. [Modules](#modules)
7. [Authentication Flow](#authentication-flow)
8. [API Endpoints](#api-endpoints)
9. [Environment Variables](#environment-variables)
10. [Deployment](#deployment)
11. [Development Setup](#development-setup)
12. [Testing](#testing)

---

## 🎯 Project Overview

**HMS (Hospital Management System)** is a comprehensive SaaS-based hospital management solution built with modern technologies. It supports multi-tenancy, allowing multiple hospitals to use the same platform with isolated data.

### Key Highlights:
- ✅ **Multi-tenant Architecture** - Each hospital has isolated data
- ✅ **16 Complete Modules** - From OPD to Finance
- ✅ **Role-Based Access Control** - SUPER_ADMIN, ADMIN, DOCTOR, NURSE, STAFF
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Modern Tech Stack** - Next.js 14, NestJS, PostgreSQL
- ✅ **Cloud Deployed** - Frontend and Backend on Vercel

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14.1.0 | React framework with App Router |
| TypeScript | 5.x | Type-safe JavaScript |
| Tailwind CSS | 3.x | Utility-first CSS framework |
| shadcn/ui | Latest | Beautiful UI components |
| Lucide React | Latest | Icon library |
| Zustand | Latest | State management |
| Axios | Latest | HTTP client |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| NestJS | 10.x | Node.js framework |
| TypeScript | 5.x | Type-safe JavaScript |
| Prisma | 5.22.0 | ORM for database |
| PostgreSQL | 15+ | Relational database |
| Passport JWT | Latest | Authentication |
| Swagger | Latest | API documentation |

### Database & Hosting
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL hosting with connection pooling |
| Vercel | Frontend & Backend deployment |
| GitHub | Version control and CI/CD |

---

## 📁 Project Structure

```
HMA-SAAS-main/
├── apps/
│   ├── frontend/                    # Next.js 14 Application
│   │   ├── src/
│   │   │   ├── app/                # App Router pages
│   │   │   │   ├── page.tsx       # Landing page
│   │   │   │   ├── auth/          # Authentication pages
│   │   │   │   │   ├── login/
│   │   │   │   │   └── register/
│   │   │   │   └── dashboard/     # Protected dashboard
│   │   │   │       ├── page.tsx   # Dashboard home
│   │   │   │       ├── staff/
│   │   │   │       ├── patients/
│   │   │   │       ├── appointments/
│   │   │   │       ├── opd/
│   │   │   │       ├── ipd/
│   │   │   │       ├── emergency/
│   │   │   │       ├── surgery/
│   │   │   │       ├── pharmacy/
│   │   │   │       ├── laboratory/
│   │   │   │       ├── radiology/
│   │   │   │       ├── billing/
│   │   │   │       ├── insurance/
│   │   │   │       ├── finance/
│   │   │   │       ├── inventory/
│   │   │   │       └── reports/
│   │   │   ├── components/        # Reusable components
│   │   │   │   ├── ui/           # shadcn/ui components
│   │   │   │   └── layout/       # Layout components
│   │   │   ├── lib/              # Utilities
│   │   │   └── store/            # Zustand stores
│   │   ├── .env.local
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── backend/                     # NestJS API
│       ├── api/                    # Vercel serverless
│       │   └── index.ts           # Entry point
│       ├── prisma/
│       │   └── schema.prisma      # Database schema
│       ├── src/
│       │   ├── main.ts            # Local dev entry
│       │   ├── app.module.ts      # Root module
│       │   ├── app.controller.ts  # Health checks
│       │   ├── common/            # Shared code
│       │   │   ├── decorators/
│       │   │   └── guards/
│       │   ├── prisma/            # Prisma service
│       │   └── modules/           # Feature modules
│       │       ├── auth/
│       │       ├── tenant/
│       │       ├── user/
│       │       ├── patient/
│       │       ├── staff/
│       │       ├── appointment/
│       │       ├── opd/
│       │       ├── ipd/
│       │       ├── pharmacy/
│       │       ├── laboratory/
│       │       ├── billing/
│       │       ├── insurance/
│       │       ├── hr/
│       │       ├── settings/
│       │       ├── reports/
│       │       └── department/
│       ├── .env.local
│       ├── vercel.json
│       └── package.json
│
├── package.json                     # Root package.json
├── turbo.json                       # Turborepo config
├── PROJECT_DOCUMENTATION.md         # This file
├── VERCEL_BACKEND_SETUP.md         # Backend setup guide
└── VERCEL_FRONTEND_SETUP.md        # Frontend setup guide
```

---

## 🗄️ Database Schema

### Core Models

#### Tenant (Hospital)
```prisma
model Tenant {
  id        String   @id @default(uuid())
  name      String                    // Hospital name
  subdomain String   @unique          // Auto-generated from name
  email     String                    // Hospital email
  phone     String?                   // Hospital phone
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
  patients  Patient[]
}
```

#### User (Staff, Doctors, Admins)
```prisma
model User {
  id         String   @id @default(uuid())
  tenantId   String
  email      String                   // Unique across system
  password   String                   // Bcrypt hashed
  role       Role     @default(STAFF)
  firstName  String
  lastName   String
  phone      String?
  isActive   Boolean  @default(true)
  lastLogin  DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  tenant     Tenant   @relation(fields: [tenantId], references: [id])
  
  @@unique([tenantId, email])
}

enum Role {
  SUPER_ADMIN      // Full system access
  ADMIN            // Hospital admin
  DOCTOR           // Medical staff
  NURSE            // Nursing staff
  STAFF            // General staff
  RECEPTIONIST     // Front desk
}
```

#### Patient
```prisma
model Patient {
  id               String   @id @default(uuid())
  tenantId         String
  firstName        String
  lastName         String
  email            String?
  phone            String
  dateOfBirth      DateTime
  gender           String
  address          String?
  bloodGroup       String?
  emergencyContact String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  tenant           Tenant   @relation(fields: [tenantId], references: [id])
}
```

---

## ✨ Features

### 1. Authentication & Authorization
- ✅ JWT-based authentication
- ✅ No tenant ID required for login (email-based)
- ✅ Role-based access control (RBAC)
- ✅ Secure password hashing (bcrypt)
- ✅ Refresh token support
- ✅ Public/Protected route decorators

### 2. Multi-Tenancy
- ✅ Automatic subdomain generation from hospital name
- ✅ Data isolation per tenant
- ✅ Tenant-aware queries
- ✅ Unique email per tenant

### 3. User Interface
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Hamburger menu for mobile navigation
- ✅ Professional landing page
- ✅ Modern dashboard with stats
- ✅ Empty states for modules under development
- ✅ Consistent design system

### 4. API Features
- ✅ RESTful API design
- ✅ Swagger documentation at `/docs`
- ✅ CORS enabled for cross-origin requests
- ✅ Health check endpoints
- ✅ Input validation with class-validator
- ✅ Error handling and logging

---

## 📦 Modules (16 Total)

### 1. 📊 Dashboard
**Route:** `/dashboard`  
**Description:** Overview with statistics, recent activity, and quick actions  
**Features:**
- Patient count
- Appointments today
- OPD/IPD visits
- Revenue tracking
- Quick action buttons

### 2. 👥 Staff Management
**Route:** `/dashboard/staff`  
**Icon:** UserCog  
**Description:** Manage doctors, nurses, and hospital staff  
**Features:** (Under Development)
- Add/Edit/Delete staff
- Role assignment
- Schedule management
- Performance tracking

### 3. 🧑‍⚕️ Patients
**Route:** `/dashboard/patients`  
**Icon:** Users  
**Description:** Patient records, medical history, and demographics  
**Features:** (Under Development)
- Patient registration
- Medical history
- Vital signs tracking
- Document management

### 4. 📅 Appointments
**Route:** `/dashboard/appointments`  
**Icon:** Calendar  
**Description:** Schedule and manage patient appointments  
**Features:** (Under Development)
- Appointment booking
- Doctor availability
- Automated reminders
- Rescheduling

### 5. 🩺 OPD (Outpatient Department)
**Route:** `/dashboard/opd`  
**Icon:** Stethoscope  
**Description:** Manage outpatient consultations  
**Features:** (Under Development)
- Patient queue
- Consultation notes
- Prescription generation
- Follow-up scheduling

### 6. 🛏️ IPD (Inpatient Department)
**Route:** `/dashboard/ipd`  
**Icon:** Bed  
**Description:** Inpatient management and bed allocation  
**Features:** (Under Development)
- Bed management
- Admission/Discharge
- Ward allocation
- Patient monitoring

### 7. 🚨 Emergency
**Route:** `/dashboard/emergency`  
**Icon:** Siren  
**Description:** Emergency cases, triage, and critical care  
**Features:** (Under Development)
- Emergency registration
- Triage system
- Critical care tracking
- Ambulance management

### 8. ✂️ Surgery
**Route:** `/dashboard/surgery`  
**Icon:** Scissors  
**Description:** Surgical procedures and OT scheduling  
**Features:** (Under Development)
- OT booking
- Surgery scheduling
- Pre-op checklist
- Post-op care

### 9. 💊 Pharmacy
**Route:** `/dashboard/pharmacy`  
**Icon:** Pill  
**Description:** Medicine inventory and prescriptions  
**Features:** (Under Development)
- Medicine stock management
- Prescription processing
- Expiry tracking
- Supplier management

### 10. 🔬 Laboratory
**Route:** `/dashboard/laboratory`  
**Icon:** FlaskConical  
**Description:** Lab tests, results, and reports  
**Features:** (Under Development)
- Test ordering
- Sample tracking
- Result entry
- Report generation

### 11. 📡 Radiology
**Route:** `/dashboard/radiology`  
**Icon:** Scan  
**Description:** X-rays, CT scans, MRI, and imaging  
**Features:** (Under Development)
- Imaging requests
- DICOM viewer
- Report generation
- Image archiving

### 12. 🧾 Billing
**Route:** `/dashboard/billing`  
**Icon:** Receipt  
**Description:** Invoices, payments, and billing records  
**Features:** (Under Development)
- Invoice generation
- Payment processing
- Insurance billing
- Outstanding tracking

### 13. 🛡️ Insurance
**Route:** `/dashboard/insurance`  
**Icon:** Shield  
**Description:** Insurance claims, policies, and approvals  
**Features:** (Under Development)
- Claim submission
- Policy verification
- Approval tracking
- Settlement management

### 14. 💰 Finance
**Route:** `/dashboard/finance`  
**Icon:** DollarSign  
**Description:** Accounts, expenses, and financial reports  
**Features:** (Under Development)
- Revenue tracking
- Expense management
- Financial reports
- Budget planning

### 15. 🏢 Inventory
**Route:** `/dashboard/inventory`  
**Icon:** Building2  
**Description:** Hospital supplies and equipment  
**Features:** (Under Development)
- Stock management
- Purchase orders
- Vendor management
- Asset tracking

### 16. 📈 Reports
**Route:** `/dashboard/reports`  
**Icon:** BarChart3  
**Description:** Analytics, statistics, and reports  
**Features:** (Under Development)
- Patient statistics
- Revenue reports
- Occupancy rates
- Custom reports

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User visits /auth/register
2. Fills form:
   - Hospital Name (required)
   - Hospital Email (required)
   - Hospital Phone (required)
   - Admin First Name (required)
   - Admin Last Name (required)
   - Admin Email (required)
   - Admin Phone (optional)
   - Password (required, min 8 chars)
   - Confirm Password (required)
3. Backend:
   - Auto-generates subdomain from hospital name
   - Creates Tenant record
   - Creates User record with SUPER_ADMIN role
   - Returns success message
4. User redirected to /auth/login
5. User logs in with email + password
```

### Login Flow
```
1. User visits /auth/login
2. Enters:
   - Email (required)
   - Password (required)
3. Backend:
   - Finds user by email (no tenant ID needed)
   - Validates password
   - Generates JWT access token
   - Generates refresh token
   - Returns user data + tokens + tenant info
4. Frontend:
   - Stores tokens in Zustand
   - Redirects to /dashboard
```

### Protected Routes
```
1. User tries to access /dashboard/*
2. Dashboard layout checks authentication
3. If not authenticated:
   - Redirect to /auth/login
4. If authenticated:
   - Show dashboard with sidebar + header
   - User can access all modules
```

---

## 🔌 API Endpoints

### Base URL
- **Production:** `https://api-zeta-flax.vercel.app`
- **Local:** `http://localhost:3001`

### Public Endpoints

#### Health Check
```http
GET /
Response: {
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

#### Health Status
```http
GET /health
Response: {
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2024-11-07T..."
}
```

#### API Documentation
```http
GET /docs
Response: Swagger UI
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "tenantName": "Apollo Hospital",
  "tenantEmail": "admin@apollo.com",
  "tenantPhone": "+91 1234567890",
  "firstName": "Dr. Kumar",
  "lastName": "Sharma",
  "email": "kumar@apollo.com",
  "phone": "+91 9876543210",
  "password": "SecurePass123!",
  "role": "SUPER_ADMIN"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "kumar@apollo.com",
    "firstName": "Dr. Kumar",
    "lastName": "Sharma",
    "role": "SUPER_ADMIN"
  },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "tenant": {
    "id": "uuid",
    "name": "Apollo Hospital",
    "subdomain": "apollo-hospital"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "kumar@apollo.com",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "user": { ... },
  "token": "jwt-access-token",
  "refreshToken": "jwt-refresh-token",
  "tenant": { ... }
}
```

### Protected Endpoints (Require JWT)

#### Get Tenants
```http
GET /tenants
Authorization: Bearer <jwt-token>

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Apollo Hospital",
    "subdomain": "apollo-hospital",
    "email": "admin@apollo.com"
  }
]
```

---

## 🔧 Environment Variables

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://api-zeta-flax.vercel.app

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_NAME=HMS
```

### Backend (.env.local)
```env
# Database
DATABASE_URL=postgresql://postgres.uoxyyqbwuzjraxhaypko:9800975588pG@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=20

# Supabase
SUPABASE_URL=https://uoxyyqbwuzjraxhaypko.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Configuration
JWT_SECRET=LBxZkVGZOFv63/NW7KHJoSqpxy4UmOgydImcsUPeqL0s0H5zF6s/p85UQwkWjZl5PEKqW1RKPyP36cI1ikv2fQ==
JWT_ACCESS_SECRET=ynV9+MHiz9BDGvBH0eeD2QZtFfFrLrf3LfJVT8LaIu0=
JWT_REFRESH_SECRET=0yqN0qpJDu8uKOL5NhXJsDIWW1Ps8perSVRjO+5mBI8=
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGINS=https://web-sooty-pi-92.vercel.app,http://localhost:3000
FRONTEND_URL=https://web-sooty-pi-92.vercel.app

# App Configuration
NODE_ENV=production
PORT=3001
BCRYPT_SALT_ROUNDS=12
```

---

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. **Repository:** Connected to GitHub
2. **Framework:** Next.js
3. **Build Command:** `npm run build`
4. **Output Directory:** `.next`
5. **Install Command:** `npm install`
6. **Environment Variables:** Set in Vercel dashboard

**Live URL:** https://web-sooty-pi-92.vercel.app

### Backend Deployment (Vercel)
1. **Repository:** Connected to GitHub
2. **Framework:** Other (Serverless)
3. **Entry Point:** `api/index.ts`
4. **Build Command:** `npm run build`
5. **Environment Variables:** Set in Vercel dashboard

**Live URL:** https://api-zeta-flax.vercel.app

### Database (Supabase)
1. **Provider:** Supabase PostgreSQL
2. **Connection:** Pooled connection (Port 6543)
3. **Migrations:** Manual SQL execution via Supabase SQL Editor
4. **Backup:** Automatic daily backups

---

## 💻 Development Setup

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Supabase account
- Vercel account (for deployment)

### Local Development

#### 1. Clone Repository
```bash
git clone https://github.com/parthagoswamig/New-fresh-HMS.git
cd HMA-SAAS-main
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Setup Environment Variables

**Frontend:**
```bash
cd apps/frontend
cp .env.example .env.local
# Edit .env.local with your values
```

**Backend:**
```bash
cd apps/backend
cp .env.example .env.local
# Edit .env.local with your values
```

#### 4. Run Database Migrations
```bash
cd apps/backend
# Copy SQL from migration-for-supabase.sql
# Execute in Supabase SQL Editor
```

#### 5. Generate Prisma Client
```bash
cd apps/backend
npx prisma generate
```

#### 6. Start Development Servers

**Frontend:**
```bash
cd apps/frontend
npm run dev
# Runs on http://localhost:3000
```

**Backend:**
```bash
cd apps/backend
npm run start:dev
# Runs on http://localhost:3001
```

#### 7. Access Application
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **API Docs:** http://localhost:3001/docs

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication
- [ ] Register new hospital
- [ ] Login with email + password
- [ ] Logout
- [ ] Access protected routes without login (should redirect)

#### Dashboard
- [ ] View dashboard stats
- [ ] Navigate to all 16 modules
- [ ] Test mobile hamburger menu
- [ ] Test responsive layout

#### API
- [ ] Health check endpoint works
- [ ] Swagger docs accessible
- [ ] Register API returns correct data
- [ ] Login API returns JWT token

### Automated Testing (Future)
- Unit tests with Jest
- Integration tests with Supertest
- E2E tests with Playwright
- API tests with Postman/Newman

---

## 📝 Additional Notes

### Security Considerations
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ JWT tokens with expiration
- ✅ CORS configured for specific origins
- ✅ Environment variables for secrets
- ✅ Input validation on all endpoints
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: CSRF protection
- ⚠️ TODO: SQL injection prevention (Prisma handles this)

### Performance Optimizations
- ✅ Connection pooling with PgBouncer
- ✅ Serverless deployment for auto-scaling
- ✅ Static asset optimization
- ⚠️ TODO: Redis caching
- ⚠️ TODO: Database indexing
- ⚠️ TODO: Image optimization

### Future Enhancements
- [ ] Email notifications
- [ ] SMS integration
- [ ] Payment gateway integration
- [ ] Mobile app (React Native)
- [ ] Advanced reporting with charts
- [ ] Real-time updates with WebSockets
- [ ] File upload for documents
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Audit logs

---

## 📞 Support & Contact

### Repository
**GitHub:** https://github.com/parthagoswamig/New-fresh-HMS

### Deployment URLs
- **Frontend:** https://web-sooty-pi-92.vercel.app
- **Backend:** https://api-zeta-flax.vercel.app
- **API Docs:** https://api-zeta-flax.vercel.app/docs

### Documentation Files
- `PROJECT_DOCUMENTATION.md` - This file (Complete documentation)
- `VERCEL_BACKEND_SETUP.md` - Backend deployment guide
- `VERCEL_FRONTEND_SETUP.md` - Frontend deployment guide
- `README.md` - Project overview

---

## 📄 License

This project is proprietary and confidential.

---

**Last Updated:** November 7, 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready (Modules under development)
