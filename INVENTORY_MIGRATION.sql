-- =====================================================
-- INVENTORY MANAGEMENT MODULE MIGRATION
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- CREATE ENUMS
-- =====================================================

CREATE TYPE "ItemCategory" AS ENUM (
  'MEDICINE',
  'CONSUMABLE',
  'EQUIPMENT',
  'SURGICAL',
  'LABORATORY',
  'GENERAL'
);

CREATE TYPE "StockStatus" AS ENUM (
  'IN_STOCK',
  'LOW_STOCK',
  'OUT_OF_STOCK',
  'EXPIRED'
);

CREATE TYPE "PurchaseOrderStatus" AS ENUM (
  'DRAFT',
  'APPROVED',
  'ORDERED',
  'RECEIVED',
  'CANCELLED'
);

CREATE TYPE "RequisitionStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'PARTIALLY_ISSUED',
  'ISSUED',
  'REJECTED'
);

CREATE TYPE "TransferStatus" AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED',
  'COMPLETED'
);

CREATE TYPE "AdjustmentReason" AS ENUM (
  'DAMAGE',
  'LOSS',
  'THEFT',
  'SAMPLE',
  'EXPIRED',
  'CORRECTION',
  'OTHER'
);

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Suppliers Table
CREATE TABLE "suppliers" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "supplierCode" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contactPerson" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "gstNumber" TEXT,
  "panNumber" TEXT,
  "paymentTerms" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "suppliers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "suppliers_tenantId_supplierCode_key" UNIQUE ("tenantId", "supplierCode")
);

CREATE INDEX "suppliers_tenantId_idx" ON "suppliers"("tenantId");

-- Inventory Items Table
CREATE TABLE "inventory_items" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "itemCode" TEXT NOT NULL,
  "itemName" TEXT NOT NULL,
  "category" "ItemCategory" NOT NULL,
  "subcategory" TEXT,
  "unit" TEXT NOT NULL,
  "unitConversion" JSONB,
  "reorderLevel" INTEGER DEFAULT 10,
  "tax" DOUBLE PRECISION DEFAULT 0,
  "brand" TEXT,
  "supplierId" TEXT,
  "description" TEXT,
  "departmentAccess" JSONB,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "inventory_items_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "inventory_items_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id"),
  CONSTRAINT "inventory_items_tenantId_itemCode_key" UNIQUE ("tenantId", "itemCode")
);

CREATE INDEX "inventory_items_tenantId_idx" ON "inventory_items"("tenantId");
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- Stock Batches Table
CREATE TABLE "stock_batches" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "batchNumber" TEXT NOT NULL,
  "departmentId" TEXT,
  "quantity" INTEGER NOT NULL,
  "receivedQuantity" INTEGER NOT NULL,
  "issuedQuantity" INTEGER DEFAULT 0,
  "availableQuantity" INTEGER NOT NULL,
  "costPrice" DOUBLE PRECISION NOT NULL,
  "mrp" DOUBLE PRECISION,
  "expiryDate" TIMESTAMP(3),
  "receivedDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "invoiceNumber" TEXT,
  "grnNumber" TEXT,
  "status" "StockStatus" DEFAULT 'IN_STOCK',
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_batches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "stock_batches_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id"),
  CONSTRAINT "stock_batches_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id")
);

CREATE INDEX "stock_batches_tenantId_idx" ON "stock_batches"("tenantId");
CREATE INDEX "stock_batches_itemId_idx" ON "stock_batches"("itemId");
CREATE INDEX "stock_batches_expiryDate_idx" ON "stock_batches"("expiryDate");
CREATE INDEX "stock_batches_status_idx" ON "stock_batches"("status");

-- Purchase Orders Table
CREATE TABLE "purchase_orders" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "poNumber" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "orderDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "expectedDeliveryDate" TIMESTAMP(3),
  "status" "PurchaseOrderStatus" DEFAULT 'DRAFT',
  "totalAmount" DOUBLE PRECISION DEFAULT 0,
  "tax" DOUBLE PRECISION DEFAULT 0,
  "grandTotal" DOUBLE PRECISION DEFAULT 0,
  "notes" TEXT,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "receivedAt" TIMESTAMP(3),
  "invoiceUrl" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "purchase_orders_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "purchase_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id"),
  CONSTRAINT "purchase_orders_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "staff"("id"),
  CONSTRAINT "purchase_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "staff"("id"),
  CONSTRAINT "purchase_orders_tenantId_poNumber_key" UNIQUE ("tenantId", "poNumber")
);

CREATE INDEX "purchase_orders_tenantId_idx" ON "purchase_orders"("tenantId");
CREATE INDEX "purchase_orders_supplierId_idx" ON "purchase_orders"("supplierId");
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders"("status");

-- Purchase Order Items Table
CREATE TABLE "purchase_order_items" (
  "id" TEXT PRIMARY KEY,
  "purchaseOrderId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "receivedQuantity" INTEGER DEFAULT 0,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "tax" DOUBLE PRECISION DEFAULT 0,
  "totalPrice" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "purchase_order_items_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE,
  CONSTRAINT "purchase_order_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id")
);

CREATE INDEX "purchase_order_items_purchaseOrderId_idx" ON "purchase_order_items"("purchaseOrderId");
CREATE INDEX "purchase_order_items_itemId_idx" ON "purchase_order_items"("itemId");

-- Requisitions Table
CREATE TABLE "requisitions" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "requisitionNumber" TEXT NOT NULL,
  "departmentId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "status" "RequisitionStatus" DEFAULT 'PENDING',
  "requestDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "issuedById" TEXT,
  "issuedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "requisitions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "requisitions_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id"),
  CONSTRAINT "requisitions_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "staff"("id"),
  CONSTRAINT "requisitions_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "staff"("id"),
  CONSTRAINT "requisitions_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "staff"("id"),
  CONSTRAINT "requisitions_tenantId_requisitionNumber_key" UNIQUE ("tenantId", "requisitionNumber")
);

CREATE INDEX "requisitions_tenantId_idx" ON "requisitions"("tenantId");
CREATE INDEX "requisitions_departmentId_idx" ON "requisitions"("departmentId");
CREATE INDEX "requisitions_status_idx" ON "requisitions"("status");

-- Requisition Items Table
CREATE TABLE "requisition_items" (
  "id" TEXT PRIMARY KEY,
  "requisitionId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "requestedQuantity" INTEGER NOT NULL,
  "approvedQuantity" INTEGER,
  "issuedQuantity" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "requisition_items_requisitionId_fkey" FOREIGN KEY ("requisitionId") REFERENCES "requisitions"("id") ON DELETE CASCADE,
  CONSTRAINT "requisition_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id")
);

CREATE INDEX "requisition_items_requisitionId_idx" ON "requisition_items"("requisitionId");
CREATE INDEX "requisition_items_itemId_idx" ON "requisition_items"("itemId");

-- Stock Transfers Table
CREATE TABLE "stock_transfers" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "transferNumber" TEXT NOT NULL,
  "fromDepartmentId" TEXT NOT NULL,
  "toDepartmentId" TEXT NOT NULL,
  "requestedById" TEXT NOT NULL,
  "status" "TransferStatus" DEFAULT 'PENDING',
  "requestDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "approvedById" TEXT,
  "approvedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_transfers_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "stock_transfers_fromDepartmentId_fkey" FOREIGN KEY ("fromDepartmentId") REFERENCES "departments"("id"),
  CONSTRAINT "stock_transfers_toDepartmentId_fkey" FOREIGN KEY ("toDepartmentId") REFERENCES "departments"("id"),
  CONSTRAINT "stock_transfers_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "staff"("id"),
  CONSTRAINT "stock_transfers_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "staff"("id"),
  CONSTRAINT "stock_transfers_tenantId_transferNumber_key" UNIQUE ("tenantId", "transferNumber")
);

CREATE INDEX "stock_transfers_tenantId_idx" ON "stock_transfers"("tenantId");
CREATE INDEX "stock_transfers_fromDepartmentId_idx" ON "stock_transfers"("fromDepartmentId");
CREATE INDEX "stock_transfers_toDepartmentId_idx" ON "stock_transfers"("toDepartmentId");
CREATE INDEX "stock_transfers_status_idx" ON "stock_transfers"("status");

-- Transfer Items Table
CREATE TABLE "transfer_items" (
  "id" TEXT PRIMARY KEY,
  "transferId" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "transfer_items_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "stock_transfers"("id") ON DELETE CASCADE,
  CONSTRAINT "transfer_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id")
);

CREATE INDEX "transfer_items_transferId_idx" ON "transfer_items"("transferId");
CREATE INDEX "transfer_items_itemId_idx" ON "transfer_items"("itemId");

-- Stock Adjustments Table
CREATE TABLE "stock_adjustments" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "adjustmentNumber" TEXT NOT NULL,
  "itemId" TEXT NOT NULL,
  "departmentId" TEXT,
  "batchNumber" TEXT,
  "quantityBefore" INTEGER NOT NULL,
  "quantityAfter" INTEGER NOT NULL,
  "adjustmentQuantity" INTEGER NOT NULL,
  "reason" "AdjustmentReason" NOT NULL,
  "reasonNotes" TEXT,
  "adjustedById" TEXT NOT NULL,
  "adjustedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "stock_adjustments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE,
  CONSTRAINT "stock_adjustments_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "inventory_items"("id"),
  CONSTRAINT "stock_adjustments_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id"),
  CONSTRAINT "stock_adjustments_adjustedById_fkey" FOREIGN KEY ("adjustedById") REFERENCES "staff"("id"),
  CONSTRAINT "stock_adjustments_tenantId_adjustmentNumber_key" UNIQUE ("tenantId", "adjustmentNumber")
);

CREATE INDEX "stock_adjustments_tenantId_idx" ON "stock_adjustments"("tenantId");
CREATE INDEX "stock_adjustments_itemId_idx" ON "stock_adjustments"("itemId");
CREATE INDEX "stock_adjustments_adjustedAt_idx" ON "stock_adjustments"("adjustedAt");

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE "suppliers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "inventory_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_batches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "purchase_order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisitions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "requisition_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_transfers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transfer_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "stock_adjustments" ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE RLS POLICIES
-- =====================================================

-- Suppliers Policies
CREATE POLICY "suppliers_tenant_isolation" ON "suppliers"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Inventory Items Policies
CREATE POLICY "inventory_items_tenant_isolation" ON "inventory_items"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Stock Batches Policies
CREATE POLICY "stock_batches_tenant_isolation" ON "stock_batches"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Purchase Orders Policies
CREATE POLICY "purchase_orders_tenant_isolation" ON "purchase_orders"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Purchase Order Items Policies (inherit from parent)
CREATE POLICY "purchase_order_items_access" ON "purchase_order_items"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "purchase_orders"
    WHERE "purchase_orders"."id" = "purchase_order_items"."purchaseOrderId"
      AND "purchase_orders"."tenantId" = current_setting('app.current_tenant_id', TRUE)
  ));

-- Requisitions Policies
CREATE POLICY "requisitions_tenant_isolation" ON "requisitions"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Requisition Items Policies (inherit from parent)
CREATE POLICY "requisition_items_access" ON "requisition_items"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "requisitions"
    WHERE "requisitions"."id" = "requisition_items"."requisitionId"
      AND "requisitions"."tenantId" = current_setting('app.current_tenant_id', TRUE)
  ));

-- Stock Transfers Policies
CREATE POLICY "stock_transfers_tenant_isolation" ON "stock_transfers"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- Transfer Items Policies (inherit from parent)
CREATE POLICY "transfer_items_access" ON "transfer_items"
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM "stock_transfers"
    WHERE "stock_transfers"."id" = "transfer_items"."transferId"
      AND "stock_transfers"."tenantId" = current_setting('app.current_tenant_id', TRUE)
  ));

-- Stock Adjustments Policies
CREATE POLICY "stock_adjustments_tenant_isolation" ON "stock_adjustments"
  FOR ALL
  USING ("tenantId" = current_setting('app.current_tenant_id', TRUE));

-- =====================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Suppliers
CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON "suppliers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inventory Items
CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON "inventory_items"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Stock Batches
CREATE TRIGGER update_stock_batches_updated_at
  BEFORE UPDATE ON "stock_batches"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Purchase Orders
CREATE TRIGGER update_purchase_orders_updated_at
  BEFORE UPDATE ON "purchase_orders"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Requisitions
CREATE TRIGGER update_requisitions_updated_at
  BEFORE UPDATE ON "requisitions"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Stock Transfers
CREATE TRIGGER update_stock_transfers_updated_at
  BEFORE UPDATE ON "stock_transfers"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT ALL ON "suppliers" TO authenticated;
GRANT ALL ON "inventory_items" TO authenticated;
GRANT ALL ON "stock_batches" TO authenticated;
GRANT ALL ON "purchase_orders" TO authenticated;
GRANT ALL ON "purchase_order_items" TO authenticated;
GRANT ALL ON "requisitions" TO authenticated;
GRANT ALL ON "requisition_items" TO authenticated;
GRANT ALL ON "stock_transfers" TO authenticated;
GRANT ALL ON "transfer_items" TO authenticated;
GRANT ALL ON "stock_adjustments" TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'suppliers',
    'inventory_items',
    'stock_batches',
    'purchase_orders',
    'purchase_order_items',
    'requisitions',
    'requisition_items',
    'stock_transfers',
    'transfer_items',
    'stock_adjustments'
  );

-- Verify enums were created
SELECT typname 
FROM pg_type 
WHERE typname IN (
  'ItemCategory',
  'StockStatus',
  'PurchaseOrderStatus',
  'RequisitionStatus',
  'TransferStatus',
  'AdjustmentReason'
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Inventory Module: ✅ Complete
-- Tables Created: 10
-- Enums Created: 6
-- RLS Policies: ✅ Enabled
-- Triggers: ✅ Auto-update timestamps
-- Indexes: ✅ Performance optimized
-- =====================================================
