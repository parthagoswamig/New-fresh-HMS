# 🧪 Frontend Lab Module - Complete Structure Guide

## 🔴 Current Issue

**Problem:** আপনি lab form-এ নতুন changes দেখতে পাচ্ছেন না।

**কারণ:** Frontend-এ **3টি আলাদা system** দরকার, কিন্তু এখন শুধু 1টি আছে।

---

## 📊 Lab Module Structure (3 Systems)

### **System 1: Lab Test Catalog** 🧪 (Missing - Need to Create)
**Purpose:** Lab test master data manage করা (CBC, LFT, etc.)

**Routes:**
- `/dashboard/lab-tests` - List all test masters
- `/dashboard/lab-tests/new` - Create new test master
- `/dashboard/lab-tests/[id]` - View test details
- `/dashboard/lab-tests/[id]/edit` - Edit test master

**API:** `/lab-tests`
**Service:** `labTestService` ✅ Created

**Example:**
```typescript
// Create CBC test
{
  name: "Complete Blood Count",
  category: "Hematology",
  price: 500,
  unit: "cells/μL",
  referenceRange: "4000-11000"
}
```

---

### **System 2: Lab Entries** 📋 (Missing - Need to Create)
**Purpose:** Patient-দের জন্য multiple tests একসাথে order করা

**Routes:**
- `/dashboard/lab-entries` - List all patient orders
- `/dashboard/lab-entries/new` - Create new patient order
- `/dashboard/lab-entries/[id]` - View order details
- `/dashboard/lab-entries/[id]/results` - Add test results
- `/dashboard/lab-entries/[id]/print` - Print report

**API:** `/lab-entries`
**Service:** `labEntryService` ✅ Created

**Example:**
```typescript
// Patient orders 2 tests
{
  patientId: "patient-123",
  tests: [
    { labTestId: "cbc-id", testName: "CBC", price: 500 },
    { labTestId: "lft-id", testName: "LFT", price: 800 }
  ],
  totalAmount: 1300
}
```

---

### **System 3: Lab Orders** 🔬 (Existing - Old System)
**Purpose:** Individual test orders (পুরনো system)

**Routes:**
- `/dashboard/laboratory` - ✅ Exists
- `/dashboard/laboratory/new` - ✅ Exists
- `/dashboard/laboratory/[id]` - ✅ Exists

**API:** `/laboratory`
**Service:** `laboratoryService` ✅ Exists

---

## 📁 Required Folder Structure

```
apps/frontend/src/app/dashboard/
├── lab-tests/              ⚠️ MISSING - Need to Create
│   ├── page.tsx           (List test masters)
│   ├── new/
│   │   └── page.tsx       (Create test master)
│   └── [id]/
│       ├── page.tsx       (View test details)
│       └── edit/
│           └── page.tsx   (Edit test master)
│
├── lab-entries/            ⚠️ MISSING - Need to Create
│   ├── page.tsx           (List patient orders)
│   ├── new/
│   │   └── page.tsx       (Create patient order)
│   └── [id]/
│       ├── page.tsx       (View order details)
│       ├── results/
│       │   └── page.tsx   (Add test results)
│       └── print/
│           └── page.tsx   (Print report)
│
└── laboratory/             ✅ EXISTS (Old System)
    ├── page.tsx
    ├── new/
    │   └── page.tsx
    └── [id]/
        └── page.tsx
```

---

## 🔧 Services Created

### **1. Lab Test Service** ✅
**File:** `services/lab-test.service.ts`

```typescript
labTestService.createTest()      // Create test master
labTestService.listTests()       // List all tests
labTestService.getTestById()     // Get test details
labTestService.updateTest()      // Update test
labTestService.removeTest()      // Delete test
labTestService.getTestStats()    // Get statistics
labTestService.getCategories()   // Get categories
```

### **2. Lab Entry Service** ✅
**File:** `services/lab-entry.service.ts`

```typescript
labEntryService.createEntry()    // Create patient order
labEntryService.listEntries()    // List all orders
labEntryService.getEntryById()   // Get order details
labEntryService.addResults()     // Add test results
labEntryService.getPrintData()   // Get print data
labEntryService.createBill()     // Create bill
labEntryService.removeEntry()    // Delete order
labEntryService.getStats()       // Get statistics
```

### **3. Laboratory Service** ✅ (Existing)
**File:** `services/laboratory.service.ts`

```typescript
laboratoryService.create()       // Create lab order
laboratoryService.list()         // List orders
laboratoryService.getById()      // Get order
laboratoryService.update()       // Update order
laboratoryService.remove()       // Delete order
laboratoryService.getStats()     // Get stats
```

---

## 🎯 What You Need to Do

### **Option 1: Quick Fix (Recommended)**
**Just add Lab Test Catalog management:**

1. Create `/dashboard/lab-tests` folder
2. Create pages for CRUD operations
3. Use `labTestService` for API calls

**This will allow you to:**
- Add test masters (CBC, LFT, etc.)
- View all available tests
- Edit test prices, units, ranges
- Deactivate tests

### **Option 2: Complete Implementation**
**Add both Lab Test Catalog + Lab Entries:**

1. Create `/dashboard/lab-tests` folder (Test catalog)
2. Create `/dashboard/lab-entries` folder (Patient orders)
3. Use respective services

**This will give you:**
- Complete lab test management
- Multi-test patient orders
- Result entry workflow
- Professional reports

---

## 📝 Example: Lab Test Catalog Page

### **Create Test Master Form:**

```typescript
// /dashboard/lab-tests/new/page.tsx

const [formData, setFormData] = useState({
  name: '',              // Test name (e.g., "CBC")
  category: '',          // Category (e.g., "Hematology")
  price: 0,              // Price (e.g., 500)
  description: '',       // Description
  unit: '',              // Unit (e.g., "cells/μL")
  referenceRange: '',    // Range (e.g., "4000-11000")
});

const handleSubmit = async () => {
  await labTestService.createTest(formData, tenantId);
  router.push('/dashboard/lab-tests');
};
```

### **List Tests Page:**

```typescript
// /dashboard/lab-tests/page.tsx

const [tests, setTests] = useState([]);

useEffect(() => {
  const fetchTests = async () => {
    const response = await labTestService.listTests(
      { page: 1, limit: 10 },
      tenantId
    );
    setTests(response.data.data);
  };
  fetchTests();
}, []);

// Display tests in table
tests.map(test => (
  <tr key={test.id}>
    <td>{test.name}</td>
    <td>{test.category}</td>
    <td>₹{test.price}</td>
    <td>{test.unit}</td>
    <td>{test.referenceRange}</td>
    <td>
      <Button onClick={() => router.push(`/dashboard/lab-tests/${test.id}/edit`)}>
        Edit
      </Button>
    </td>
  </tr>
))
```

---

## 🔄 Complete Workflow

### **Step 1: Setup (Admin)**
```
1. Go to /dashboard/lab-tests
2. Click "New Test"
3. Add test details:
   - Name: "Complete Blood Count"
   - Category: "Hematology"
   - Price: 500
   - Unit: "cells/μL"
   - Range: "4000-11000"
4. Save
```

### **Step 2: Patient Order (Receptionist)**
```
1. Go to /dashboard/lab-entries/new
2. Select patient
3. Select multiple tests (CBC, LFT)
4. System calculates total
5. Choose "Bill Now" or "Bill Later"
6. Submit
```

### **Step 3: Add Results (Lab Tech)**
```
1. Go to /dashboard/lab-entries
2. Click on pending order
3. Click "Add Results"
4. Enter result values
5. Add findings/interpretation
6. Submit
```

### **Step 4: Print Report (Doctor/Lab Tech)**
```
1. Go to /dashboard/lab-entries
2. Click on completed order
3. Click "Print Report"
4. Professional PDF opens
5. Print or save
```

---

## 🚀 Quick Start Guide

### **Immediate Action:**

1. **Create Lab Test Catalog Pages:**
   ```bash
   mkdir -p apps/frontend/src/app/dashboard/lab-tests/new
   mkdir -p apps/frontend/src/app/dashboard/lab-tests/[id]/edit
   ```

2. **Copy existing laboratory pages as template:**
   ```bash
   # Use laboratory/new/page.tsx as reference
   # Modify to use labTestService instead
   ```

3. **Update form fields:**
   ```typescript
   // Remove: patientId, orderedById, result
   // Keep: name, category, price, description, unit, referenceRange
   ```

4. **Test the flow:**
   ```
   1. Create test master
   2. View in list
   3. Edit test
   4. Use in patient orders
   ```

---

## 📊 API Endpoints Summary

| System | Frontend Route | Backend API | Service |
|--------|---------------|-------------|---------|
| Test Catalog | `/dashboard/lab-tests` | `/lab-tests` | `labTestService` |
| Patient Orders | `/dashboard/lab-entries` | `/lab-entries` | `labEntryService` |
| Old System | `/dashboard/laboratory` | `/laboratory` | `laboratoryService` |

---

## ✅ Checklist

### **Backend:** ✅ Complete
- [x] Lab Test API (`/lab-tests`)
- [x] Lab Entry API (`/lab-entries`)
- [x] Lab Order API (`/laboratory`)
- [x] Services created
- [x] Controllers created
- [x] DTOs created

### **Frontend:** ⚠️ Incomplete
- [x] Services created (`labTestService`, `labEntryService`)
- [ ] Lab Test pages (Need to create)
- [ ] Lab Entry pages (Need to create)
- [x] Lab Order pages (Exists)

---

## 🎯 Summary

**আপনার সমস্যা:**
- Frontend-এ শুধু old system (`/laboratory`) আছে
- New systems (`/lab-tests`, `/lab-entries`) এর pages নেই

**সমাধান:**
1. `/dashboard/lab-tests` folder create করুন
2. Test catalog management pages বানান
3. `labTestService` use করুন

**এরপর:**
- Test masters add করতে পারবেন (CBC, LFT, etc.)
- Patient orders create করতে পারবেন
- Results add করতে পারবেন
- Reports print করতে পারবেন

---

**Next Step:** Create `/dashboard/lab-tests` pages first! 🚀
