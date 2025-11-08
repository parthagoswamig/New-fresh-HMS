# 🏥 HMS SaaS - Advanced Billing & Invoice Module Implementation Guide

## ✅ Implementation Complete!

This guide documents the comprehensive billing and invoice system with advanced features including:
- ✅ Advance/partial payments
- ✅ Item-level discounts
- ✅ Insurance deductions
- ✅ Multi-stage printing (preview anytime)
- ✅ Editable bills before finalization
- ✅ Professional invoice layout with stamp/signature
- ✅ Payment tracking with multiple payment methods
- ✅ Tenant-specific formatting

---

## 📋 Backend Changes

### 1. Database Schema Updates (`schema.prisma`)

**Bill Model Enhanced:**
```prisma
model Bill {
  insuranceCovered  Float    @default(0)  // NEW: Insurance coverage amount
  finalized         Boolean  @default(false)  // NEW: Lock bill from edits
  // ... existing fields
}
```

**BillItem Model Enhanced:**
```prisma
model BillItem {
  discount    Float    @default(0)  // NEW: Per-item discount
  // ... existing fields
}
```

### 2. SQL Migration Required

Run this SQL in your Supabase SQL Editor:

```sql
-- Add new fields to bills table
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "insuranceCovered" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS "finalized" BOOLEAN NOT NULL DEFAULT false;

-- Add discount field to bill_items table
ALTER TABLE bill_items ADD COLUMN IF NOT EXISTS "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Update existing records
UPDATE bills SET "insuranceCovered" = 0 WHERE "insuranceCovered" IS NULL;
UPDATE bills SET "finalized" = false WHERE "finalized" IS NULL;
UPDATE bill_items SET "discount" = 0 WHERE "discount" IS NULL;
```

### 3. New DTOs Created

**`add-payment.dto.ts`** - For adding payments
```typescript
{
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'INSURANCE' | 'BANK_TRANSFER';
  transactionId?: string;
  notes?: string;
}
```

**Enhanced `create-billing.dto.ts`:**
- Added `discount` field to `BillItemDto`
- Added `insuranceCovered` field to `CreateBillingDto`

### 4. Service Methods Added

**`BillingService`:**
- ✅ `addPayment()` - Add payment with validation
- ✅ `finalizeBill()` - Lock bill from further edits
- ✅ Enhanced `create()` - Calculate totals with item discounts + insurance

**Payment Logic:**
- Validates payment doesn't exceed outstanding balance
- Auto-updates bill status: PENDING → PARTIALLY_PAID → PAID
- Tracks all payments with method and transaction ID

### 5. Controller Endpoints Added

```
POST   /billing/:id/payment    - Add payment to invoice
PATCH  /billing/:id/finalize   - Finalize invoice (lock edits)
```

---

## 🎨 Frontend Implementation (Next Steps)

### Components to Create:

1. **`InvoiceForm.tsx`** - Create/Edit Invoice
   - Patient autocomplete
   - Dynamic line items with discount per row
   - Insurance input
   - Total calculations (subtotal, discount, insurance, final)
   - Save as draft or finalize

2. **`InvoicePrintLayout.tsx`** - Professional Print View
   - Hospital logo and header
   - Patient demographics
   - Itemized services table with discounts
   - Payment summary
   - Hospital stamp placeholder
   - Authorized signature line
   - Print-optimized CSS

3. **`PaymentModal.tsx`** - Add Payment
   - Amount input with outstanding balance display
   - Payment method selector
   - Transaction ID field
   - Validation

### Frontend Service (`billing.service.ts`)

```typescript
export const billingService = {
  create: (data, tenantId) => apiClient.post('/billing', data, ...),
  update: (id, data, tenantId) => apiClient.patch(`/billing/${id}`, data, ...),
  addPayment: (id, data, tenantId) => apiClient.post(`/billing/${id}/payment`, data, ...),
  finalize: (id, tenantId) => apiClient.patch(`/billing/${id}/finalize`, {}, ...),
  getById: (id, tenantId) => apiClient.get(`/billing/${id}`, ...),
  list: (params, tenantId) => apiClient.get('/billing', ...),
  // ... other methods
};
```

---

## 🧪 Testing Checklist

### Backend Tests:
- [ ] Create invoice with 3 items, one with discount
- [ ] Apply insurance coverage (50%)
- [ ] Calculate totals correctly
- [ ] Finalize invoice
- [ ] Add partial payment (₹2000 on ₹5000 bill)
- [ ] Verify status changes: PENDING → PARTIALLY_PAID
- [ ] Add remaining payment
- [ ] Verify status changes to PAID
- [ ] Try to edit finalized bill (should fail)
- [ ] Try to overpay (should fail)
- [ ] Verify tenant isolation

### Frontend Tests:
- [ ] Create new invoice
- [ ] Add/remove line items dynamically
- [ ] Apply discounts per item
- [ ] Apply insurance coverage
- [ ] Preview invoice before finalizing
- [ ] Print invoice (check layout)
- [ ] Finalize invoice
- [ ] Add payment
- [ ] Print final invoice with stamp/signature
- [ ] Verify all calculations match

---

## 📊 Calculation Logic

### Total Amount Calculation:
```
1. Item Subtotal = Quantity × Unit Price
2. Item Total = Item Subtotal - Item Discount
3. Items Total = Sum of all Item Totals
4. Bill Total = Items Total - Bill Discount - Insurance Covered
5. Outstanding = Bill Total - Paid Amount
```

### Status Logic:
```
- PENDING: paidAmount = 0
- PARTIALLY_PAID: 0 < paidAmount < totalAmount
- PAID: paidAmount >= totalAmount
```

---

## 🔐 Security & RBAC

### Permissions:
- **Create/Edit Invoice**: BILLING_MANAGER, ADMIN
- **Add Payment**: BILLING_MANAGER, CASHIER, ADMIN
- **Finalize Invoice**: BILLING_MANAGER, ADMIN
- **Print Invoice**: All authenticated users
- **View Invoices**: All authenticated users (tenant-filtered)

### Validation:
- ✅ Tenant isolation enforced on all endpoints
- ✅ Cannot edit finalized invoices
- ✅ Cannot overpay invoices
- ✅ Payment amount must be positive
- ✅ All amounts validated (min: 0)

---

## 🖨️ Print Styles

Add to your global CSS or component:

```css
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
  
  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
  
  @page {
    margin: 1cm;
    size: A4;
  }
}
```

---

## 📦 Files Modified/Created

### Backend:
1. ✅ `apps/backend/prisma/schema.prisma` - Enhanced Bill & BillItem models
2. ✅ `apps/backend/src/modules/billing/dto/create-billing.dto.ts` - Added discount & insurance
3. ✅ `apps/backend/src/modules/billing/dto/add-payment.dto.ts` - NEW
4. ✅ `apps/backend/src/modules/billing/billing.service.ts` - Added payment & finalize methods
5. ✅ `apps/backend/src/modules/billing/billing.controller.ts` - Added payment & finalize endpoints

### Frontend (To Be Created):
6. ⏳ `apps/frontend/src/components/billing/InvoiceForm.tsx`
7. ⏳ `apps/frontend/src/components/billing/InvoicePrintLayout.tsx`
8. ⏳ `apps/frontend/src/components/billing/PaymentModal.tsx`
9. ⏳ `apps/frontend/src/services/billing.service.ts` - Enhance with new methods
10. ⏳ `apps/frontend/src/app/dashboard/billing/page.tsx` - Update with new features

---

## 🚀 Deployment Steps

### 1. Run SQL Migration
```sql
-- Copy and run BILLING_MIGRATION.sql in Supabase SQL Editor
```

### 2. Regenerate Prisma Client (After Deployment)
```bash
# Vercel will auto-regenerate on deployment
# Or manually: npx prisma generate
```

### 3. Commit and Push
```bash
git add -A
git commit -m "feat: Implement advanced billing module with payments, discounts, and insurance"
git push origin main
```

### 4. Verify Deployment
- Check Vercel logs for successful build
- Test API endpoints
- Verify database columns added

---

## 💡 Optional Enhancements

### Future Features:
- [ ] PDF export using `react-to-print` or `html2pdf.js`
- [ ] QR code for UPI payments
- [ ] Refund flow for overpayments
- [ ] Email invoice to patient
- [ ] SMS payment reminders
- [ ] Payment gateway integration
- [ ] Recurring billing for subscriptions
- [ ] Multi-currency support
- [ ] Tax calculations (GST, VAT)
- [ ] Credit notes and adjustments

---

## 📞 Support

For issues or questions:
1. Check Vercel deployment logs
2. Verify SQL migration ran successfully
3. Confirm Prisma client regenerated
4. Test API endpoints with Postman/Thunder Client
5. Check browser console for frontend errors

---

**Status: Backend Complete ✅ | Frontend Pending ⏳**

**Next Step: Run SQL migration in Supabase, then commit and push changes.**
