import apiClient from '@/lib/api-client';

// Types
export type ItemCategory = 'MEDICINE' | 'CONSUMABLE' | 'EQUIPMENT' | 'SURGICAL' | 'LABORATORY' | 'GENERAL';
export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRED';
export type PurchaseOrderStatus = 'DRAFT' | 'APPROVED' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
export type RequisitionStatus = 'PENDING' | 'APPROVED' | 'PARTIALLY_ISSUED' | 'ISSUED' | 'REJECTED';
export type TransferStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
export type AdjustmentReason = 'DAMAGE' | 'LOSS' | 'THEFT' | 'SAMPLE' | 'EXPIRED' | 'CORRECTION' | 'OTHER';

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  category: ItemCategory;
  subcategory?: string;
  unit: string;
  unitConversion?: any;
  reorderLevel: number;
  tax: number;
  brand?: string;
  supplierId?: string;
  supplier?: Supplier;
  description?: string;
  departmentAccess?: string[];
  isActive: boolean;
  totalStock?: number;
  stockStatus?: StockStatus;
  stockBatches?: StockBatch[];
  createdAt: string;
  updatedAt: string;
}

export interface StockBatch {
  id: string;
  itemId: string;
  batchNumber: string;
  departmentId?: string;
  quantity: number;
  receivedQuantity: number;
  issuedQuantity: number;
  availableQuantity: number;
  costPrice: number;
  mrp?: number;
  expiryDate?: string;
  receivedDate: string;
  invoiceNumber?: string;
  grnNumber?: string;
  status: StockStatus;
  item?: InventoryItem;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplier?: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
  totalAmount: number;
  tax: number;
  grandTotal: number;
  notes?: string;
  approvedById?: string;
  approvedAt?: string;
  receivedAt?: string;
  invoiceUrl?: string;
  createdById: string;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  item?: InventoryItem;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  tax: number;
  totalPrice: number;
}

export interface Requisition {
  id: string;
  requisitionNumber: string;
  departmentId: string;
  department?: any;
  requestedById: string;
  requestedBy?: any;
  status: RequisitionStatus;
  requestDate: string;
  approvedById?: string;
  approvedAt?: string;
  issuedById?: string;
  issuedAt?: string;
  notes?: string;
  items: RequisitionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RequisitionItem {
  id: string;
  requisitionId: string;
  itemId: string;
  item?: InventoryItem;
  requestedQuantity: number;
  approvedQuantity?: number;
  issuedQuantity: number;
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromDepartmentId: string;
  fromDepartment?: any;
  toDepartmentId: string;
  toDepartment?: any;
  requestedById: string;
  requestedBy?: any;
  status: TransferStatus;
  requestDate: string;
  approvedById?: string;
  approvedAt?: string;
  completedAt?: string;
  notes?: string;
  items: TransferItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransferItem {
  id: string;
  transferId: string;
  itemId: string;
  item?: InventoryItem;
  quantity: number;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  itemId: string;
  item?: InventoryItem;
  departmentId?: string;
  batchNumber?: string;
  quantityBefore: number;
  quantityAfter: number;
  adjustmentQuantity: number;
  reason: AdjustmentReason;
  reasonNotes?: string;
  adjustedById: string;
  adjustedBy?: any;
  adjustedAt: string;
  createdAt: string;
}

const inventoryService = {
  // Suppliers
  createSupplier: (data: any, tenantId: string) =>
    apiClient.post('/inventory/suppliers', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getSuppliers: (tenantId: string, isActive?: boolean) =>
    apiClient.get('/inventory/suppliers', { 
      headers: { 'x-tenant-id': tenantId },
      params: { isActive }
    }),
  
  getSupplierById: (id: string, tenantId: string) =>
    apiClient.get(`/inventory/suppliers/${id}`, { headers: { 'x-tenant-id': tenantId } }),
  
  updateSupplier: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/inventory/suppliers/${id}`, data, { headers: { 'x-tenant-id': tenantId } }),

  // Items
  createItem: (data: any, tenantId: string) =>
    apiClient.post('/inventory/items', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getItems: (tenantId: string, params?: { category?: string; search?: string; isActive?: boolean }) =>
    apiClient.get('/inventory/items', { 
      headers: { 'x-tenant-id': tenantId },
      params
    }),
  
  getItemById: (id: string, tenantId: string) =>
    apiClient.get(`/inventory/items/${id}`, { headers: { 'x-tenant-id': tenantId } }),
  
  updateItem: (id: string, data: any, tenantId: string) =>
    apiClient.patch(`/inventory/items/${id}`, data, { headers: { 'x-tenant-id': tenantId } }),
  
  deleteItem: (id: string, tenantId: string) =>
    apiClient.delete(`/inventory/items/${id}`, { headers: { 'x-tenant-id': tenantId } }),

  // Purchase Orders
  createPurchaseOrder: (data: any, tenantId: string) =>
    apiClient.post('/inventory/purchase-orders', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getPurchaseOrders: (tenantId: string, params?: { status?: string; supplierId?: string }) =>
    apiClient.get('/inventory/purchase-orders', { 
      headers: { 'x-tenant-id': tenantId },
      params
    }),
  
  getPurchaseOrderById: (id: string, tenantId: string) =>
    apiClient.get(`/inventory/purchase-orders/${id}`, { headers: { 'x-tenant-id': tenantId } }),
  
  approvePurchaseOrder: (id: string, approvedById: string, tenantId: string) =>
    apiClient.post(`/inventory/purchase-orders/${id}/approve`, { approvedById }, { headers: { 'x-tenant-id': tenantId } }),
  
  updatePOStatus: (id: string, status: string, tenantId: string) =>
    apiClient.patch(`/inventory/purchase-orders/${id}/status`, { status }, { headers: { 'x-tenant-id': tenantId } }),

  // Stock Receipt
  receiveStock: (data: any, tenantId: string) =>
    apiClient.post('/inventory/receive-stock', data, { headers: { 'x-tenant-id': tenantId } }),

  // Stock Queries
  getStockByItem: (itemId: string, tenantId: string, departmentId?: string) =>
    apiClient.get(`/inventory/stock/item/${itemId}`, { 
      headers: { 'x-tenant-id': tenantId },
      params: { departmentId }
    }),
  
  getLowStockItems: (tenantId: string) =>
    apiClient.get('/inventory/stock/low-stock', { headers: { 'x-tenant-id': tenantId } }),
  
  getExpiringStock: (tenantId: string, days?: number) =>
    apiClient.get('/inventory/stock/expiring', { 
      headers: { 'x-tenant-id': tenantId },
      params: { days }
    }),

  // Requisitions
  createRequisition: (data: any, tenantId: string) =>
    apiClient.post('/inventory/requisitions', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getRequisitions: (tenantId: string, params?: { departmentId?: string; status?: string }) =>
    apiClient.get('/inventory/requisitions', { 
      headers: { 'x-tenant-id': tenantId },
      params
    }),
  
  approveRequisition: (data: any, tenantId: string) =>
    apiClient.post('/inventory/requisitions/approve', data, { headers: { 'x-tenant-id': tenantId } }),
  
  issueStock: (data: any, tenantId: string) =>
    apiClient.post('/inventory/requisitions/issue', data, { headers: { 'x-tenant-id': tenantId } }),

  // Transfers
  createTransfer: (data: any, tenantId: string) =>
    apiClient.post('/inventory/transfers', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getTransfers: (tenantId: string, params?: { departmentId?: string; status?: string }) =>
    apiClient.get('/inventory/transfers', { 
      headers: { 'x-tenant-id': tenantId },
      params
    }),
  
  approveTransfer: (data: any, tenantId: string) =>
    apiClient.post('/inventory/transfers/approve', data, { headers: { 'x-tenant-id': tenantId } }),

  // Adjustments
  createAdjustment: (data: any, tenantId: string) =>
    apiClient.post('/inventory/adjustments', data, { headers: { 'x-tenant-id': tenantId } }),
  
  getAdjustments: (tenantId: string, itemId?: string) =>
    apiClient.get('/inventory/adjustments', { 
      headers: { 'x-tenant-id': tenantId },
      params: { itemId }
    }),

  // Reports
  getInventoryReport: (tenantId: string, category?: string) =>
    apiClient.get('/inventory/reports/inventory', { 
      headers: { 'x-tenant-id': tenantId },
      params: { category }
    }),

  // Module Integrations
  deductStockForPharmacy: (
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; departmentId?: string }>,
    reference: { type: 'PRESCRIPTION' | 'SALE'; referenceId: string }
  ) =>
    apiClient.post('/inventory/integrations/pharmacy/deduct', { items, reference }, { 
      headers: { 'x-tenant-id': tenantId }
    }),

  deductStockForLab: (
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number }>,
    reference: { type: 'LAB_TEST'; referenceId: string; departmentId?: string }
  ) =>
    apiClient.post('/inventory/integrations/lab/deduct', { items, reference }, { 
      headers: { 'x-tenant-id': tenantId }
    }),

  getItemCostForBilling: (
    tenantId: string,
    itemCode: string,
    quantity: number,
    departmentId?: string
  ) =>
    apiClient.get(`/inventory/integrations/billing/cost/${itemCode}`, { 
      headers: { 'x-tenant-id': tenantId },
      params: { quantity, departmentId }
    }),

  checkStockAvailability: (
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; departmentId?: string }>
  ) =>
    apiClient.post('/inventory/integrations/check-availability', { items }, { 
      headers: { 'x-tenant-id': tenantId }
    }),

  reverseStockDeduction: (
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; batchNumber: string }>,
    reason: string
  ) =>
    apiClient.post('/inventory/integrations/reverse-deduction', { items, reason }, { 
      headers: { 'x-tenant-id': tenantId }
    }),

  // Finance Module Integration
  getPurchaseExpenses: (
    tenantId: string,
    startDate?: string,
    endDate?: string
  ) =>
    apiClient.get('/inventory/integrations/finance/purchase-expenses', { 
      headers: { 'x-tenant-id': tenantId },
      params: { startDate, endDate }
    }),

  getConsumptionExpenses: (
    tenantId: string,
    startDate?: string,
    endDate?: string
  ) =>
    apiClient.get('/inventory/integrations/finance/consumption-expenses', { 
      headers: { 'x-tenant-id': tenantId },
      params: { startDate, endDate }
    }),

  getSupplierPaymentSummary: (tenantId: string) =>
    apiClient.get('/inventory/integrations/finance/supplier-payments', { 
      headers: { 'x-tenant-id': tenantId }
    }),

  getMonthlyExpenseSummary: (
    tenantId: string,
    year: number,
    month: number
  ) =>
    apiClient.get('/inventory/integrations/finance/monthly-summary', { 
      headers: { 'x-tenant-id': tenantId },
      params: { year, month }
    }),
};

export default inventoryService;
