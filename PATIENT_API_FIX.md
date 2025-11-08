# ✅ Patient API Error Fixed

## 🔴 Error:
```
Failed to load resource: the server responded with a status of 404 ()
/api/patients?tenantId=xxx
Failed to fetch patients: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
TypeError: j.map is not a function
```

## 🔍 Root Cause:
The new lab entry page was using:
```typescript
❌ fetch('/api/patients?tenantId=xxx')  // Next.js API route (doesn't exist)
```

Instead of:
```typescript
✅ patientService.list()  // Backend API via apiClient
```

## ✅ Fix Applied:

### File: `apps/frontend/src/app/dashboard/lab-entries/new/page.tsx`

**1. Added import:**
```typescript
import { patientService } from '@/services/patients.service';
```

**2. Fixed fetchPatients:**
```typescript
// Before:
const fetchPatients = async () => {
  const response = await fetch(`/api/patients?tenantId=${tenant?.id}`);
  const data = await response.json();
  setPatients(data.data || []);
};

// After:
const fetchPatients = async () => {
  try {
    const response = await patientService.list({ limit: 100 }, tenant?.id || '');
    const patientData = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    setPatients(patientData);
  } catch (error) {
    console.error('Failed to fetch patients:', error);
    setPatients([]);
  }
};
```

**3. Improved fetchTests with same pattern:**
```typescript
const fetchTests = async () => {
  try {
    const response = await labTestService.listTests({
      isActive: true,
      limit: 100,
    }, tenant?.id || '');
    const testData = Array.isArray(response.data) 
      ? response.data 
      : (response.data?.data || []);
    setAvailableTests(testData);
  } catch (error) {
    console.error('Failed to fetch tests:', error);
    setAvailableTests([]);
  }
};
```

## ✅ What This Fixes:

1. ✅ Uses correct backend API endpoint
2. ✅ Proper authentication headers (via apiClient)
3. ✅ Tenant isolation (x-tenant-id header)
4. ✅ Handles both response formats (array or object)
5. ✅ Better error handling
6. ✅ Prevents `.map is not a function` errors

## 🚀 Deploy:

```bash
git add apps/frontend/src/app/dashboard/lab-entries/new/page.tsx
git commit -m "fix: Use patient service instead of direct API call in lab entry form"
git push origin main
```

Wait 2-3 minutes for Vercel deployment, then test again!
