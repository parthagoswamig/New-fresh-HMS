# ✅ Filter Error Fixed

## 🔴 Error:
```
TypeError: t.filter is not a function
at v (page-964549c4d35e2de7.js:1:972)
```

## 🔍 Root Cause:

The backend returns:
```json
{
  "data": [...],  // array of entries
  "meta": { "total": 10, "page": 1, "limit": 10, "totalPages": 1 }
}
```

But the frontend was doing:
```typescript
setEntries(response.data);  // This sets entries to the whole object
```

Then later:
```typescript
const filteredEntries = entries.filter(...)  // ❌ Fails! entries is an object, not array
```

## ✅ Fix Applied:

### File: `apps/frontend/src/app/dashboard/lab-entries/page.tsx`

```typescript
// Before:
const response = await labEntryService.listEntries(params, tenant?.id || '');
setEntries(response.data);

// After:
const response = await labEntryService.listEntries(params, tenant?.id || '');
// Handle both array and object response formats
const entriesData = Array.isArray(response.data) 
  ? response.data 
  : (response.data?.data || response.data?.entries || []);
setEntries(entriesData);
```

Also added error handling:
```typescript
catch (error) {
  console.error('Failed to fetch entries:', error);
  setEntries([]);  // ✅ Ensure entries is always an array
}
```

## ✅ What This Fixes:

1. ✅ Correctly extracts array from `response.data.data`
2. ✅ Handles multiple response formats (array or object)
3. ✅ Ensures `entries` is always an array
4. ✅ Prevents `.filter is not a function` error
5. ✅ Better error handling

## 🚀 Deploy:

```bash
git add apps/frontend/src/app/dashboard/lab-entries/page.tsx
git commit -m "fix: Handle nested data structure in lab entries response"
git push origin main
```

Wait 2-3 minutes for deployment!

## 📊 Backend Response Structure:

```typescript
// /lab-entries endpoint returns:
{
  data: [
    {
      id: "xxx",
      entryNumber: "LAB001",
      patient: { ... },
      items: [ ... ],
      status: "ORDERED",
      ...
    }
  ],
  meta: {
    total: 10,
    page: 1,
    limit: 10,
    totalPages: 1
  }
}
```

Frontend needs to access `response.data.data` to get the array!
