import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { CreateRequisitionDto, ApproveRequisitionDto, IssueStockDto } from './dto/create-requisition.dto';
import { CreateTransferDto, ApproveTransferDto } from './dto/create-transfer.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // ==================== SUPPLIERS ====================
  async createSupplier(tenantId: string, dto: CreateSupplierDto) {
    const supplierCode = dto.supplierCode || await this.generateSupplierCode(tenantId);
    
    return this.prisma.supplier.create({
      data: {
        tenantId,
        supplierCode,
        ...dto,
      },
    });
  }

  async getSuppliers(tenantId: string, isActive?: boolean) {
    return this.prisma.supplier.findMany({
      where: {
        tenantId,
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { name: 'asc' },
    });
  }

  async getSupplierById(id: string, tenantId: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: {
        inventoryItems: true,
        purchaseOrders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!supplier) {
      throw new NotFoundException('Supplier not found');
    }

    return supplier;
  }

  async updateSupplier(id: string, tenantId: string, dto: Partial<CreateSupplierDto>) {
    return this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
  }

  private async generateSupplierCode(tenantId: string): Promise<string> {
    const count = await this.prisma.supplier.count({ where: { tenantId } });
    return `SUP-${String(count + 1).padStart(4, '0')}`;
  }

  // ==================== INVENTORY ITEMS ====================
  async createItem(tenantId: string, dto: CreateItemDto) {
    const itemCode = dto.itemCode || await this.generateItemCode(tenantId);
    
    return this.prisma.inventoryItem.create({
      data: {
        tenantId,
        itemCode,
        itemName: dto.itemName,
        category: dto.category,
        subcategory: dto.subcategory,
        unit: dto.unit,
        unitConversion: dto.unitConversion || {},
        reorderLevel: dto.reorderLevel || 10,
        tax: dto.tax || 0,
        brand: dto.brand,
        supplierId: dto.supplierId,
        description: dto.description,
        departmentAccess: dto.departmentAccess || [],
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        supplier: true,
      },
    });
  }

  async getItems(
    tenantId: string,
    category?: string,
    search?: string,
    isActive?: boolean,
  ) {
    return this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        ...(category && { category: category as any }),
        ...(isActive !== undefined && { isActive }),
        ...(search && {
          OR: [
            { itemName: { contains: search, mode: 'insensitive' } },
            { itemCode: { contains: search, mode: 'insensitive' } },
            { brand: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        supplier: true,
        stockBatches: {
          where: { availableQuantity: { gt: 0 } },
        },
      },
      orderBy: { itemName: 'asc' },
    });
  }

  async getItemById(id: string, tenantId: string) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        stockBatches: {
          orderBy: { expiryDate: 'asc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    // Calculate total stock
    const totalStock = item.stockBatches.reduce(
      (sum, batch) => sum + batch.availableQuantity,
      0,
    );

    return {
      ...item,
      totalStock,
      stockStatus:
        totalStock === 0
          ? 'OUT_OF_STOCK'
          : totalStock <= item.reorderLevel
          ? 'LOW_STOCK'
          : 'IN_STOCK',
    };
  }

  async updateItem(id: string, tenantId: string, dto: Partial<CreateItemDto>) {
    return this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });
  }

  async deleteItem(id: string, tenantId: string) {
    // Check if item has stock
    const stockCount = await this.prisma.stockBatch.count({
      where: { itemId: id, availableQuantity: { gt: 0 } },
    });

    if (stockCount > 0) {
      throw new BadRequestException('Cannot delete item with available stock');
    }

    return this.prisma.inventoryItem.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async generateItemCode(tenantId: string): Promise<string> {
    const count = await this.prisma.inventoryItem.count({ where: { tenantId } });
    return `ITM-${String(count + 1).padStart(5, '0')}`;
  }

  // ==================== PURCHASE ORDERS ====================
  async createPurchaseOrder(tenantId: string, dto: CreatePurchaseOrderDto) {
    const poNumber = await this.generatePONumber(tenantId);

    // Calculate totals
    let totalAmount = 0;
    let totalTax = 0;

    const itemsData = dto.items.map((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      const itemTax = (itemTotal * (item.tax || 0)) / 100;
      totalAmount += itemTotal;
      totalTax += itemTax;

      return {
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax || 0,
        totalPrice: itemTotal + itemTax,
      };
    });

    const grandTotal = totalAmount + totalTax;

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        poNumber,
        supplierId: dto.supplierId,
        expectedDeliveryDate: dto.expectedDeliveryDate,
        totalAmount,
        tax: totalTax,
        grandTotal,
        notes: dto.notes,
        createdById: dto.createdById,
        items: {
          create: itemsData,
        },
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async getPurchaseOrders(
    tenantId: string,
    status?: string,
    supplierId?: string,
  ) {
    return this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        ...(status && { status: status as any }),
        ...(supplierId && { supplierId }),
      },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPurchaseOrderById(id: string, tenantId: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: {
        supplier: true,
        items: {
          include: {
            item: true,
          },
        },
        createdBy: {
          include: {
            user: true,
          },
        },
        approvedBy: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    return po;
  }

  async approvePurchaseOrder(id: string, tenantId: string, approvedById: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedById,
        approvedAt: new Date(),
      },
    });
  }

  async updatePOStatus(id: string, tenantId: string, status: string) {
    return this.prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any },
    });
  }

  private async generatePONumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.purchaseOrder.count({
      where: { tenantId },
    });
    return `PO-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  // ==================== RECEIVE STOCK ====================
  async receiveStock(tenantId: string, dto: ReceiveStockDto) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id: dto.purchaseOrderId, tenantId },
      include: { items: true },
    });

    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    // Create stock batches and update PO items
    for (const item of dto.items) {
      // Create stock batch
      await this.prisma.stockBatch.create({
        data: {
          tenantId,
          itemId: item.itemId,
          batchNumber: item.batchNumber,
          departmentId: item.departmentId,
          quantity: item.receivedQuantity,
          receivedQuantity: item.receivedQuantity,
          availableQuantity: item.receivedQuantity,
          costPrice: item.costPrice,
          mrp: item.mrp,
          expiryDate: item.expiryDate,
          invoiceNumber: dto.invoiceNumber,
          grnNumber: dto.grnNumber,
        },
      });

      // Update PO item received quantity
      await this.prisma.purchaseOrderItem.update({
        where: { id: item.poItemId },
        data: {
          receivedQuantity: {
            increment: item.receivedQuantity,
          },
        },
      });
    }

    // Update PO status
    const allItemsReceived = po.items.every(
      (item) => item.receivedQuantity >= item.quantity,
    );

    await this.prisma.purchaseOrder.update({
      where: { id: dto.purchaseOrderId },
      data: {
        status: allItemsReceived ? 'RECEIVED' : 'ORDERED',
        receivedAt: allItemsReceived ? new Date() : undefined,
        invoiceUrl: dto.invoiceUrl,
      },
    });

    return { success: true, message: 'Stock received successfully' };
  }

  // ==================== STOCK QUERIES ====================
  async getStockByItem(itemId: string, tenantId: string, departmentId?: string) {
    const batches = await this.prisma.stockBatch.findMany({
      where: {
        tenantId,
        itemId,
        ...(departmentId && { departmentId }),
        availableQuantity: { gt: 0 },
      },
      include: {
        item: true,
        department: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    const totalStock = batches.reduce((sum, batch) => sum + batch.availableQuantity, 0);

    return {
      itemId,
      totalStock,
      batches,
    };
  }

  async getLowStockItems(tenantId: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: { tenantId, isActive: true },
      include: {
        stockBatches: {
          where: { availableQuantity: { gt: 0 } },
        },
      },
    });

    return items
      .map((item) => {
        const totalStock = item.stockBatches.reduce(
          (sum, batch) => sum + batch.availableQuantity,
          0,
        );
        return { ...item, totalStock };
      })
      .filter((item) => item.totalStock <= item.reorderLevel);
  }

  async getExpiringStock(tenantId: string, days: number = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.prisma.stockBatch.findMany({
      where: {
        tenantId,
        expiryDate: {
          lte: futureDate,
          gte: new Date(),
        },
        availableQuantity: { gt: 0 },
      },
      include: {
        item: true,
        department: true,
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  // ==================== REQUISITIONS ====================
  async createRequisition(tenantId: string, dto: CreateRequisitionDto) {
    const requisitionNumber = await this.generateRequisitionNumber(tenantId);

    return this.prisma.requisition.create({
      data: {
        tenantId,
        requisitionNumber,
        departmentId: dto.departmentId,
        requestedById: dto.requestedById,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            itemId: item.itemId,
            requestedQuantity: item.requestedQuantity,
          })),
        },
      },
      include: {
        department: true,
        requestedBy: {
          include: { user: true },
        },
        items: {
          include: { item: true },
        },
      },
    });
  }

  async approveRequisition(tenantId: string, dto: ApproveRequisitionDto) {
    // Update requisition status and approved quantities
    for (const item of dto.approvedItems) {
      await this.prisma.requisitionItem.updateMany({
        where: {
          requisitionId: dto.requisitionId,
          itemId: item.itemId,
        },
        data: {
          approvedQuantity: item.approvedQuantity,
        },
      });
    }

    return this.prisma.requisition.update({
      where: { id: dto.requisitionId },
      data: {
        status: 'APPROVED',
        approvedById: dto.approvedById,
        approvedAt: new Date(),
      },
      include: {
        items: {
          include: { item: true },
        },
      },
    });
  }

  async issueStock(tenantId: string, dto: IssueStockDto) {
    // Issue stock from batches and update requisition
    for (const item of dto.issuedItems) {
      // Find and update batch
      const batch = await this.prisma.stockBatch.findFirst({
        where: {
          tenantId,
          itemId: item.itemId,
          batchNumber: item.batchNumber,
          availableQuantity: { gte: item.issuedQuantity },
        },
      });

      if (!batch) {
        throw new BadRequestException(
          `Insufficient stock for item ${item.itemId} in batch ${item.batchNumber}`,
        );
      }

      // Update batch quantity
      await this.prisma.stockBatch.update({
        where: { id: batch.id },
        data: {
          issuedQuantity: { increment: item.issuedQuantity },
          availableQuantity: { decrement: item.issuedQuantity },
        },
      });

      // Update requisition item
      await this.prisma.requisitionItem.updateMany({
        where: {
          requisitionId: dto.requisitionId,
          itemId: item.itemId,
        },
        data: {
          issuedQuantity: { increment: item.issuedQuantity },
        },
      });
    }

    // Check if fully issued
    const requisition = await this.prisma.requisition.findUnique({
      where: { id: dto.requisitionId },
      include: { items: true },
    });

    const fullyIssued = requisition.items.every(
      (item) => item.issuedQuantity >= (item.approvedQuantity || item.requestedQuantity),
    );

    return this.prisma.requisition.update({
      where: { id: dto.requisitionId },
      data: {
        status: fullyIssued ? 'ISSUED' : 'PARTIALLY_ISSUED',
        issuedById: dto.issuedById,
        issuedAt: new Date(),
      },
    });
  }

  async getRequisitions(tenantId: string, departmentId?: string, status?: string) {
    return this.prisma.requisition.findMany({
      where: {
        tenantId,
        ...(departmentId && { departmentId }),
        ...(status && { status: status as any }),
      },
      include: {
        department: true,
        requestedBy: { include: { user: true } },
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateRequisitionNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.requisition.count({ where: { tenantId } });
    return `REQ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  // ==================== STOCK TRANSFERS ====================
  async createTransfer(tenantId: string, dto: CreateTransferDto) {
    const transferNumber = await this.generateTransferNumber(tenantId);

    return this.prisma.stockTransfer.create({
      data: {
        tenantId,
        transferNumber,
        fromDepartmentId: dto.fromDepartmentId,
        toDepartmentId: dto.toDepartmentId,
        requestedById: dto.requestedById,
        notes: dto.notes,
        items: {
          create: dto.items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        fromDepartment: true,
        toDepartment: true,
        requestedBy: { include: { user: true } },
        items: { include: { item: true } },
      },
    });
  }

  async approveTransfer(tenantId: string, dto: ApproveTransferDto) {
    const transfer = await this.prisma.stockTransfer.findFirst({
      where: { id: dto.transferId, tenantId },
      include: { items: true },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer not found');
    }

    // Move stock between departments
    for (const item of transfer.items) {
      // Deduct from source department
      const sourceBatch = await this.prisma.stockBatch.findFirst({
        where: {
          tenantId,
          itemId: item.itemId,
          departmentId: transfer.fromDepartmentId,
          availableQuantity: { gte: item.quantity },
        },
        orderBy: { expiryDate: 'asc' },
      });

      if (!sourceBatch) {
        throw new BadRequestException(
          `Insufficient stock in source department for item ${item.itemId}`,
        );
      }

      await this.prisma.stockBatch.update({
        where: { id: sourceBatch.id },
        data: {
          availableQuantity: { decrement: item.quantity },
          issuedQuantity: { increment: item.quantity },
        },
      });

      // Add to destination department
      await this.prisma.stockBatch.create({
        data: {
          tenantId,
          itemId: item.itemId,
          batchNumber: sourceBatch.batchNumber,
          departmentId: transfer.toDepartmentId,
          quantity: item.quantity,
          receivedQuantity: item.quantity,
          availableQuantity: item.quantity,
          costPrice: sourceBatch.costPrice,
          mrp: sourceBatch.mrp,
          expiryDate: sourceBatch.expiryDate,
        },
      });
    }

    return this.prisma.stockTransfer.update({
      where: { id: dto.transferId },
      data: {
        status: 'COMPLETED',
        approvedById: dto.approvedById,
        approvedAt: new Date(),
        completedAt: new Date(),
      },
    });
  }

  async getTransfers(tenantId: string, departmentId?: string, status?: string) {
    return this.prisma.stockTransfer.findMany({
      where: {
        tenantId,
        ...(departmentId && {
          OR: [
            { fromDepartmentId: departmentId },
            { toDepartmentId: departmentId },
          ],
        }),
        ...(status && { status: status as any }),
      },
      include: {
        fromDepartment: true,
        toDepartment: true,
        requestedBy: { include: { user: true } },
        items: { include: { item: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async generateTransferNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.stockTransfer.count({ where: { tenantId } });
    return `TRF-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  // ==================== STOCK ADJUSTMENTS ====================
  async adjustStock(tenantId: string, dto: AdjustStockDto) {
    const adjustmentNumber = await this.generateAdjustmentNumber(tenantId);
    const adjustmentQuantity = dto.quantityAfter - dto.quantityBefore;

    // Create adjustment record
    const adjustment = await this.prisma.stockAdjustment.create({
      data: {
        tenantId,
        adjustmentNumber,
        itemId: dto.itemId,
        departmentId: dto.departmentId,
        batchNumber: dto.batchNumber,
        quantityBefore: dto.quantityBefore,
        quantityAfter: dto.quantityAfter,
        adjustmentQuantity,
        reason: dto.reason,
        reasonNotes: dto.reasonNotes,
        adjustedById: dto.adjustedById,
      },
      include: {
        item: true,
        adjustedBy: { include: { user: true } },
      },
    });

    // Update stock batch
    if (dto.batchNumber) {
      await this.prisma.stockBatch.updateMany({
        where: {
          tenantId,
          itemId: dto.itemId,
          batchNumber: dto.batchNumber,
          ...(dto.departmentId && { departmentId: dto.departmentId }),
        },
        data: {
          availableQuantity: dto.quantityAfter,
        },
      });
    }

    return adjustment;
  }

  async getAdjustments(tenantId: string, itemId?: string) {
    return this.prisma.stockAdjustment.findMany({
      where: {
        tenantId,
        ...(itemId && { itemId }),
      },
      include: {
        item: true,
        department: true,
        adjustedBy: { include: { user: true } },
      },
      orderBy: { adjustedAt: 'desc' },
    });
  }

  private async generateAdjustmentNumber(tenantId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const count = await this.prisma.stockAdjustment.count({ where: { tenantId } });
    return `ADJ-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  // ==================== REPORTS ====================
  async getInventoryReport(tenantId: string, category?: string) {
    const items = await this.prisma.inventoryItem.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(category && { category: category as any }),
      },
      include: {
        stockBatches: {
          where: { availableQuantity: { gt: 0 } },
        },
      },
    });

    return items.map((item) => {
      const totalStock = item.stockBatches.reduce(
        (sum, batch) => sum + batch.availableQuantity,
        0,
      );
      const totalValue = item.stockBatches.reduce(
        (sum, batch) => sum + batch.availableQuantity * batch.costPrice,
        0,
      );

      return {
        ...item,
        totalStock,
        totalValue,
        stockStatus:
          totalStock === 0
            ? 'OUT_OF_STOCK'
            : totalStock <= item.reorderLevel
            ? 'LOW_STOCK'
            : 'IN_STOCK',
      };
    });
  }

  // ==================== MODULE INTEGRATIONS ====================
  
  /**
   * Deduct stock for Pharmacy dispensing
   * Called when medicines are dispensed to patients
   */
  async deductStockForPharmacy(
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; departmentId?: string }>,
    reference: { type: 'PRESCRIPTION' | 'SALE'; referenceId: string },
  ) {
    const results = [];

    for (const item of items) {
      // Find item by code
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: { tenantId, itemCode: item.itemCode, category: 'MEDICINE' },
      });

      if (!inventoryItem) {
        throw new BadRequestException(`Item not found: ${item.itemCode}`);
      }

      // Find available batch (FIFO - oldest expiry first)
      const batch = await this.prisma.stockBatch.findFirst({
        where: {
          tenantId,
          itemId: inventoryItem.id,
          ...(item.departmentId && { departmentId: item.departmentId }),
          availableQuantity: { gte: item.quantity },
        },
        orderBy: { expiryDate: 'asc' },
      });

      if (!batch) {
        throw new BadRequestException(
          `Insufficient stock for ${inventoryItem.itemName}. Required: ${item.quantity}`,
        );
      }

      // Deduct stock
      await this.prisma.stockBatch.update({
        where: { id: batch.id },
        data: {
          issuedQuantity: { increment: item.quantity },
          availableQuantity: { decrement: item.quantity },
        },
      });

      results.push({
        itemCode: item.itemCode,
        itemName: inventoryItem.itemName,
        quantity: item.quantity,
        batchNumber: batch.batchNumber,
        costPrice: batch.costPrice,
      });
    }

    return {
      success: true,
      reference,
      items: results,
    };
  }

  /**
   * Deduct stock for Laboratory consumables
   * Called when lab tests are performed
   */
  async deductStockForLab(
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number }>,
    reference: { type: 'LAB_TEST'; referenceId: string; departmentId?: string },
  ) {
    const results = [];

    for (const item of items) {
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: {
          tenantId,
          itemCode: item.itemCode,
          category: { in: ['LABORATORY', 'CONSUMABLE'] },
        },
      });

      if (!inventoryItem) {
        throw new BadRequestException(`Lab item not found: ${item.itemCode}`);
      }

      const batch = await this.prisma.stockBatch.findFirst({
        where: {
          tenantId,
          itemId: inventoryItem.id,
          ...(reference.departmentId && { departmentId: reference.departmentId }),
          availableQuantity: { gte: item.quantity },
        },
        orderBy: { expiryDate: 'asc' },
      });

      if (!batch) {
        throw new BadRequestException(
          `Insufficient lab stock for ${inventoryItem.itemName}`,
        );
      }

      await this.prisma.stockBatch.update({
        where: { id: batch.id },
        data: {
          issuedQuantity: { increment: item.quantity },
          availableQuantity: { decrement: item.quantity },
        },
      });

      results.push({
        itemCode: item.itemCode,
        itemName: inventoryItem.itemName,
        quantity: item.quantity,
        batchNumber: batch.batchNumber,
        costPrice: batch.costPrice,
      });
    }

    return {
      success: true,
      reference,
      items: results,
    };
  }

  /**
   * Get item cost for billing
   * Called when generating bills to get current stock prices
   */
  async getItemCostForBilling(
    tenantId: string,
    itemCode: string,
    quantity: number,
    departmentId?: string,
  ) {
    const item = await this.prisma.inventoryItem.findFirst({
      where: { tenantId, itemCode },
    });

    if (!item) {
      throw new NotFoundException(`Item not found: ${itemCode}`);
    }

    const batch = await this.prisma.stockBatch.findFirst({
      where: {
        tenantId,
        itemId: item.id,
        ...(departmentId && { departmentId }),
        availableQuantity: { gte: quantity },
      },
      orderBy: { expiryDate: 'asc' },
    });

    if (!batch) {
      return {
        available: false,
        itemName: item.itemName,
        requestedQuantity: quantity,
        availableQuantity: 0,
      };
    }

    return {
      available: true,
      itemId: item.id,
      itemCode: item.itemCode,
      itemName: item.itemName,
      quantity,
      costPrice: batch.costPrice,
      mrp: batch.mrp,
      tax: item.tax,
      batchNumber: batch.batchNumber,
      totalCost: batch.costPrice * quantity,
      totalMRP: (batch.mrp || batch.costPrice) * quantity,
    };
  }

  /**
   * Check stock availability for multiple items
   * Used by Pharmacy/Lab before dispensing
   */
  async checkStockAvailability(
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; departmentId?: string }>,
  ) {
    const results = [];

    for (const item of items) {
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: { tenantId, itemCode: item.itemCode },
      });

      if (!inventoryItem) {
        results.push({
          itemCode: item.itemCode,
          available: false,
          reason: 'Item not found',
        });
        continue;
      }

      const totalStock = await this.prisma.stockBatch.aggregate({
        where: {
          tenantId,
          itemId: inventoryItem.id,
          ...(item.departmentId && { departmentId: item.departmentId }),
        },
        _sum: { availableQuantity: true },
      });

      const available = (totalStock._sum.availableQuantity || 0) >= item.quantity;

      results.push({
        itemCode: item.itemCode,
        itemName: inventoryItem.itemName,
        requestedQuantity: item.quantity,
        availableQuantity: totalStock._sum.availableQuantity || 0,
        available,
        reason: available ? null : 'Insufficient stock',
      });
    }

    return results;
  }

  /**
   * Reverse stock deduction (for cancelled orders/returns)
   */
  async reverseStockDeduction(
    tenantId: string,
    items: Array<{ itemCode: string; quantity: number; batchNumber: string }>,
    reason: string,
  ) {
    const results = [];

    for (const item of items) {
      const inventoryItem = await this.prisma.inventoryItem.findFirst({
        where: { tenantId, itemCode: item.itemCode },
      });

      if (!inventoryItem) continue;

      const batch = await this.prisma.stockBatch.findFirst({
        where: {
          tenantId,
          itemId: inventoryItem.id,
          batchNumber: item.batchNumber,
        },
      });

      if (batch) {
        await this.prisma.stockBatch.update({
          where: { id: batch.id },
          data: {
            issuedQuantity: { decrement: item.quantity },
            availableQuantity: { increment: item.quantity },
          },
        });

        results.push({
          itemCode: item.itemCode,
          itemName: inventoryItem.itemName,
          quantity: item.quantity,
          reversed: true,
        });
      }
    }

    return {
      success: true,
      reason,
      items: results,
    };
  }
}

