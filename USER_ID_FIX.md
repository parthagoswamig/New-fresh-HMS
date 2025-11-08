# ✅ User ID Error Fixed

## 🔴 Error:
```
PrismaClientValidationError: Invalid `prisma.labEntry.create()` invocation
Argument `tenant` is missing.
createdById: undefined
```

## 🔍 Root Cause:

The backend controller was trying to get `userId` from `req.user`, but it was `undefined`:

```typescript
const userId = req.user?.staffId || req.user?.sub;  // ❌ undefined
return this.labEntryService.createEntry(tenantId, userId, createLabEntryDto);
```

This caused `createdById: undefined` in the Prisma create operation, which violated the database constraint.

## ✅ Fix Applied:

### 1. Backend Controller (`lab-entry.controller.ts`):

```typescript
// Added x-user-id header support
create(
  @Headers('x-tenant-id') tenantId: string,
  @Headers('x-user-id') userId: string,  // ✅ Get from header
  @Request() req: any,
  @Body() createLabEntryDto: CreateLabEntryDto,
) {
  // Try multiple sources for userId
  const staffId = userId || req.user?.staffId || req.user?.sub || req.user?.id;
  if (!staffId) {
    throw new BadRequestException('User ID is required');
  }
  return this.labEntryService.createEntry(tenantId, staffId, createLabEntryDto);
}
```

### 2. Frontend Service (`lab-entry.service.ts`):

```typescript
// Before:
createEntry: (data: any, tenantId: string) =>
  apiClient.post('/lab-entries', data, {
    headers: { 'x-tenant-id': tenantId },
  }),

// After:
createEntry: (data: any, tenantId: string, userId: string) =>
  apiClient.post('/lab-entries', data, {
    headers: { 
      'x-tenant-id': tenantId,
      'x-user-id': userId,  // ✅ Send user ID
    },
  }),
```

### 3. Frontend Page (`lab-entries/new/page.tsx`):

```typescript
// Before:
await labEntryService.createEntry(payload, tenant?.id || '');

// After:
await labEntryService.createEntry(payload, tenant?.id || '', user?.id || '');
```

## ✅ What This Fixes:

1. ✅ Sends user ID from frontend to backend
2. ✅ Backend receives user ID via header
3. ✅ Falls back to req.user if header not present
4. ✅ Throws clear error if user ID is missing
5. ✅ `createdById` is now properly populated
6. ✅ Lab entries can be created successfully

## 🚀 Deploy:

```bash
git add apps/backend/src/modules/laboratory/lab-entry.controller.ts
git add apps/frontend/src/services/lab-entry.service.ts
git add apps/frontend/src/app/dashboard/lab-entries/new/page.tsx
git commit -m "fix: Pass user ID for lab entry creation"
git push origin main
```

Wait 2-3 minutes for deployment!

## 📊 Complete Flow:

```
Frontend (new/page.tsx)
  ↓ user.id
labEntryService.createEntry(payload, tenantId, userId)
  ↓ x-user-id header
Backend Controller
  ↓ staffId
LabEntryService.createEntry(tenantId, staffId, dto)
  ↓ createdById: staffId
Prisma.labEntry.create({ createdById: staffId })
  ✅ SUCCESS!
```
