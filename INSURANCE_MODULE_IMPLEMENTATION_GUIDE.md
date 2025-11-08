# 🏥 INSURANCE MODULE - COMPLETE IMPLEMENTATION GUIDE

## 📋 **MODULE OVERVIEW**

The Insurance Module is a comprehensive system for managing:
- Insurance companies and policies
- Patient insurance assignments
- Claims processing workflow
- Billing integration
- Document management
- PDF report generation

---

## ✅ **COMPLETED: PRISMA SCHEMA**

### **Models Created:**

1. **InsuranceCompany** - Insurance provider details
2. **InsurancePolicy** - Policy templates with coverage rules
3. **PatientInsurance** - Patient-policy assignments
4. **InsuranceClaim** - Claims with workflow
5. **ClaimStatus** - Enum (INITIATED, UNDER_REVIEW, APPROVED, REJECTED, SETTLED, CANCELLED)

### **Relations:**
```
Tenant → InsuranceCompany[]
Tenant → InsurancePolicy[]
Tenant → PatientInsurance[]
Tenant → InsuranceClaim[]

InsuranceCompany → InsurancePolicy[]

InsurancePolicy → PatientInsurance[]
InsurancePolicy → InsuranceClaim[]

Patient → PatientInsurance[]
Patient → InsuranceClaim[]

Staff → InsuranceClaim[] (as createdBy)

Bill → InsuranceClaim[]
```

---

## 📁 **FILES TO CREATE**

### **Backend (25+ files)**

#### **DTOs** (`apps/backend/src/modules/insurance/dto/`)
1. `create-company.dto.ts`
2. `update-company.dto.ts`
3. `create-policy.dto.ts`
4. `update-policy.dto.ts`
5. `assign-insurance.dto.ts`
6. `create-claim.dto.ts`
7. `update-claim-status.dto.ts`
8. `upload-document.dto.ts`

#### **Services** (`apps/backend/src/modules/insurance/`)
1. `insurance-company.service.ts`
2. `insurance-policy.service.ts`
3. `patient-insurance.service.ts`
4. `insurance-claim.service.ts`

#### **Controllers** (`apps/backend/src/modules/insurance/`)
1. `insurance-company.controller.ts`
2. `insurance-policy.controller.ts`
3. `patient-insurance.controller.ts`
4. `insurance-claim.controller.ts`

#### **Module**
1. `insurance.module.ts`

---

### **Frontend (15+ files)**

#### **Services** (`apps/frontend/src/services/`)
1. `insurance-company.service.ts`
2. `insurance-policy.service.ts`
3. `patient-insurance.service.ts`
4. `insurance-claim.service.ts`

#### **Store** (`apps/frontend/src/store/`)
1. `insurance-store.ts`

#### **Pages** (`apps/frontend/src/app/dashboard/insurance/`)
1. `page.tsx` - Main insurance dashboard
2. `companies/page.tsx` - Company management
3. `policies/page.tsx` - Policy management
4. `claims/page.tsx` - Claims dashboard
5. `claims/[id]/page.tsx` - Claim details

#### **Components** (`apps/frontend/src/components/insurance/`)
1. `CompanyList.tsx`
2. `AddCompanyModal.tsx`
3. `PolicyList.tsx`
4. `AddPolicyModal.tsx`
5. `PatientInsuranceCard.tsx`
6. `ClaimForm.tsx` - Multi-step wizard
7. `ClaimStatusBadge.tsx`
8. `InsuranceDeductionPreview.tsx`
9. `ClaimPDFReport.tsx` - PDF generation
10. `DocumentUpload.tsx`

---

## 🎯 **IMPLEMENTATION PRIORITY**

Due to the extensive nature of this module, I recommend implementing in phases:

### **Phase 1: Core Infrastructure** (COMPLETED ✅)
- ✅ Prisma schema
- ✅ Database relations

### **Phase 2: Company & Policy Management** (Next)
- DTOs for company/policy
- Services for CRUD operations
- Controllers with RBAC
- Frontend pages for management

### **Phase 3: Patient Insurance Assignment**
- DTOs for assignment
- Service with validation
- Frontend UI for linking

### **Phase 4: Claims Processing**
- DTOs for claims
- Service with workflow logic
- Multi-step claim form
- Status management

### **Phase 5: Billing Integration**
- Update billing service
- Invoice adjustments
- Claim status display

### **Phase 6: Documents & PDF**
- File upload endpoints
- Supabase storage integration
- PDF report generation

---

## 🚀 **QUICK START OPTION**

Would you like me to:

**Option A:** Create ALL files now (will take 10-15 messages due to size)

**Option B:** Create Phase 2 first (Company & Policy Management) - 5-6 files

**Option C:** Create a simplified version with core features only

**Option D:** Create just the SQL migration and deployment guide

---

## 📊 **ESTIMATED FILE SIZES**

- **Backend DTOs:** ~2000 lines total
- **Backend Services:** ~3000 lines total
- **Backend Controllers:** ~1500 lines total
- **Frontend Services:** ~500 lines total
- **Frontend Components:** ~4000 lines total
- **Frontend Pages:** ~2000 lines total

**Total:** ~13,000 lines of code

---

## 🎨 **UI/UX FEATURES**

### **Insurance Dashboard:**
- Stats cards (Total Companies, Active Policies, Pending Claims, Approved Claims)
- Quick actions (Add Company, Create Claim)
- Recent claims list

### **Company Management:**
- Table with search/filter
- Add/Edit modal
- Policy list per company

### **Claims Workflow:**
```
Step 1: Patient & Services Selection
  ↓
Step 2: Coverage Calculation
  ↓
Step 3: Review & Submit
  ↓
Status: INITIATED
  ↓
Review by Insurance Manager
  ↓
APPROVED / REJECTED
  ↓
If APPROVED → Update Bill
  ↓
SETTLED
```

### **Claim Form (Multi-step):**
1. **Select Patient** - Autocomplete with validation
2. **Select Services** - Checkboxes with costs
3. **Calculate Coverage** - Auto-calculate deductible
4. **Upload Documents** - Drag & drop
5. **Review** - Summary before submit

---

## 🔐 **RBAC ROLES**

| Action | Roles Allowed |
|--------|---------------|
| View Companies | ALL |
| Manage Companies | ADMIN, INSURANCE_MANAGER |
| View Policies | ALL |
| Manage Policies | ADMIN, INSURANCE_MANAGER |
| Assign Insurance to Patient | ADMIN, DOCTOR, RECEPTIONIST |
| Create Claim | ADMIN, BILLING, INSURANCE_MANAGER |
| Approve/Reject Claim | ADMIN, INSURANCE_MANAGER |
| View Claims | ALL |
| Upload Documents | ADMIN, BILLING, INSURANCE_MANAGER |

---

## 📝 **CLAIM CALCULATION LOGIC**

```typescript
// Example calculation
const totalAmount = 10000;
const coveragePercent = 80; // 80%
const deductible = 500;

// Step 1: Apply deductible
const amountAfterDeductible = totalAmount - deductible; // 9500

// Step 2: Apply coverage percentage
const coveredAmount = amountAfterDeductible * (coveragePercent / 100); // 7600

// Step 3: Calculate patient balance
const patientBalance = totalAmount - coveredAmount; // 2400

// Result:
// Total: 10000
// Covered: 7600
// Patient Pays: 2400
```

---

## 🗄️ **DATABASE MIGRATION**

**File:** `INSURANCE_MIGRATION.sql`

Creates:
- `ClaimStatus` enum
- `insurance_companies` table
- `insurance_policies` table
- `patient_insurance` table
- `insurance_claims` table
- All indexes and foreign keys

---

## 📦 **DEPENDENCIES TO INSTALL**

### **Backend:**
```bash
# Already included in NestJS
- @nestjs/common
- @nestjs/swagger
- class-validator
- class-transformer
```

### **Frontend:**
```bash
cd apps/frontend

# PDF Generation
pnpm add @react-pdf/renderer

# File Upload (if not already installed)
pnpm add react-dropzone

# Date handling
pnpm add date-fns
```

---

## 🎯 **NEXT STEPS**

Please choose how you'd like to proceed:

1. **Full Implementation** - I'll create all files (will take multiple messages)
2. **Phase-by-Phase** - Start with Company & Policy Management
3. **Core Only** - Simplified version with essential features
4. **Migration First** - Just the SQL script and deployment guide

Let me know your preference and I'll proceed accordingly! 🚀
