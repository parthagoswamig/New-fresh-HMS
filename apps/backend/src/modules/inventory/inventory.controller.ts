import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateItemDto } from './dto/create-item.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveStockDto } from './dto/receive-stock.dto';
import { CreateRequisitionDto, ApproveRequisitionDto, IssueStockDto } from './dto/create-requisition.dto';
import { CreateTransferDto, ApproveTransferDto } from './dto/create-transfer.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@ApiTags('Inventory')
@Controller('inventory')
@ApiHeader({ name: 'x-tenant-id', required: true })
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // ==================== SUPPLIERS ====================
  @Post('suppliers')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  async createSupplier(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateSupplierDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.createSupplier(tenantId, dto);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'Get all suppliers' })
  async getSuppliers(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.inventoryService.getSuppliers(tenantId, active);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier by ID' })
  async getSupplierById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getSupplierById(id, tenantId);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  async updateSupplier(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: Partial<CreateSupplierDto>,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.updateSupplier(id, tenantId, dto);
  }

  // ==================== INVENTORY ITEMS ====================
  @Post('items')
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: 'Item created successfully' })
  async createItem(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateItemDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.createItem(tenantId, dto);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all inventory items' })
  async getItems(
    @Headers('x-tenant-id') tenantId: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('isActive') isActive?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const active = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.inventoryService.getItems(tenantId, category, search, active);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get item by ID with stock details' })
  async getItemById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getItemById(id, tenantId);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update inventory item' })
  async updateItem(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: Partial<CreateItemDto>,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.updateItem(id, tenantId, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Soft delete inventory item' })
  async deleteItem(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.deleteItem(id, tenantId);
  }

  // ==================== PURCHASE ORDERS ====================
  @Post('purchase-orders')
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  async createPurchaseOrder(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.createPurchaseOrder(tenantId, dto);
  }

  @Get('purchase-orders')
  @ApiOperation({ summary: 'Get all purchase orders' })
  async getPurchaseOrders(
    @Headers('x-tenant-id') tenantId: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getPurchaseOrders(tenantId, status, supplierId);
  }

  @Get('purchase-orders/:id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async getPurchaseOrderById(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getPurchaseOrderById(id, tenantId);
  }

  @Post('purchase-orders/:id/approve')
  @ApiOperation({ summary: 'Approve a purchase order' })
  async approvePurchaseOrder(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body('approvedById') approvedById: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.approvePurchaseOrder(id, tenantId, approvedById);
  }

  @Patch('purchase-orders/:id/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  async updatePOStatus(
    @Param('id') id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body('status') status: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.updatePOStatus(id, tenantId, status);
  }

  // ==================== RECEIVE STOCK ====================
  @Post('receive-stock')
  @ApiOperation({ summary: 'Receive stock from purchase order' })
  @ApiResponse({ status: 201, description: 'Stock received successfully' })
  async receiveStock(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: ReceiveStockDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.receiveStock(tenantId, dto);
  }

  // ==================== STOCK QUERIES ====================
  @Get('stock/item/:itemId')
  @ApiOperation({ summary: 'Get stock details for an item' })
  async getStockByItem(
    @Param('itemId') itemId: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('departmentId') departmentId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getStockByItem(itemId, tenantId, departmentId);
  }

  @Get('stock/low-stock')
  @ApiOperation({ summary: 'Get items with low stock' })
  async getLowStockItems(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getLowStockItems(tenantId);
  }

  @Get('stock/expiring')
  @ApiOperation({ summary: 'Get items expiring soon' })
  async getExpiringStock(
    @Headers('x-tenant-id') tenantId: string,
    @Query('days') days?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    const daysNum = days ? parseInt(days) : 30;
    return this.inventoryService.getExpiringStock(tenantId, daysNum);
  }

  // ==================== REQUISITIONS ====================
  @Post('requisitions')
  @ApiOperation({ summary: 'Create a new requisition' })
  @ApiResponse({ status: 201, description: 'Requisition created successfully' })
  async createRequisition(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateRequisitionDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.createRequisition(tenantId, dto);
  }

  @Get('requisitions')
  @ApiOperation({ summary: 'Get all requisitions' })
  async getRequisitions(
    @Headers('x-tenant-id') tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getRequisitions(tenantId, departmentId, status);
  }

  @Post('requisitions/approve')
  @ApiOperation({ summary: 'Approve a requisition' })
  async approveRequisition(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: ApproveRequisitionDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.approveRequisition(tenantId, dto);
  }

  @Post('requisitions/issue')
  @ApiOperation({ summary: 'Issue stock for a requisition' })
  async issueStock(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: IssueStockDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.issueStock(tenantId, dto);
  }

  // ==================== STOCK TRANSFERS ====================
  @Post('transfers')
  @ApiOperation({ summary: 'Create a new stock transfer' })
  @ApiResponse({ status: 201, description: 'Transfer created successfully' })
  async createTransfer(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: CreateTransferDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.createTransfer(tenantId, dto);
  }

  @Get('transfers')
  @ApiOperation({ summary: 'Get all stock transfers' })
  async getTransfers(
    @Headers('x-tenant-id') tenantId: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getTransfers(tenantId, departmentId, status);
  }

  @Post('transfers/approve')
  @ApiOperation({ summary: 'Approve a stock transfer' })
  async approveTransfer(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: ApproveTransferDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.approveTransfer(tenantId, dto);
  }

  // ==================== STOCK ADJUSTMENTS ====================
  @Post('adjustments')
  @ApiOperation({ summary: 'Create a stock adjustment' })
  @ApiResponse({ status: 201, description: 'Adjustment created successfully' })
  async adjustStock(
    @Headers('x-tenant-id') tenantId: string,
    @Body() dto: AdjustStockDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.adjustStock(tenantId, dto);
  }

  @Get('adjustments')
  @ApiOperation({ summary: 'Get all stock adjustments' })
  async getAdjustments(
    @Headers('x-tenant-id') tenantId: string,
    @Query('itemId') itemId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getAdjustments(tenantId, itemId);
  }

  // ==================== REPORTS ====================
  @Get('reports/inventory')
  @ApiOperation({ summary: 'Get inventory report' })
  async getInventoryReport(
    @Headers('x-tenant-id') tenantId: string,
    @Query('category') category?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getInventoryReport(tenantId, category);
  }

  // ==================== MODULE INTEGRATIONS ====================
  
  @Post('integrations/pharmacy/deduct')
  @ApiOperation({ summary: 'Deduct stock for pharmacy dispensing' })
  async deductStockForPharmacy(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      items: Array<{ itemCode: string; quantity: number; departmentId?: string }>;
      reference: { type: 'PRESCRIPTION' | 'SALE'; referenceId: string };
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.deductStockForPharmacy(
      tenantId,
      body.items,
      body.reference,
    );
  }

  @Post('integrations/lab/deduct')
  @ApiOperation({ summary: 'Deduct stock for laboratory tests' })
  async deductStockForLab(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      items: Array<{ itemCode: string; quantity: number }>;
      reference: { type: 'LAB_TEST'; referenceId: string; departmentId?: string };
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.deductStockForLab(
      tenantId,
      body.items,
      body.reference,
    );
  }

  @Get('integrations/billing/cost/:itemCode')
  @ApiOperation({ summary: 'Get item cost for billing' })
  async getItemCostForBilling(
    @Param('itemCode') itemCode: string,
    @Headers('x-tenant-id') tenantId: string,
    @Query('quantity') quantity: string,
    @Query('departmentId') departmentId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getItemCostForBilling(
      tenantId,
      itemCode,
      parseInt(quantity),
      departmentId,
    );
  }

  @Post('integrations/check-availability')
  @ApiOperation({ summary: 'Check stock availability for multiple items' })
  async checkStockAvailability(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      items: Array<{ itemCode: string; quantity: number; departmentId?: string }>;
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.checkStockAvailability(tenantId, body.items);
  }

  @Post('integrations/reverse-deduction')
  @ApiOperation({ summary: 'Reverse stock deduction for returns/cancellations' })
  async reverseStockDeduction(
    @Headers('x-tenant-id') tenantId: string,
    @Body() body: {
      items: Array<{ itemCode: string; quantity: number; batchNumber: string }>;
      reason: string;
    },
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.reverseStockDeduction(
      tenantId,
      body.items,
      body.reason,
    );
  }

  // ==================== FINANCE MODULE INTEGRATION ====================
  
  @Get('integrations/finance/purchase-expenses')
  @ApiOperation({ summary: 'Get purchase expenses for Finance module' })
  async getPurchaseExpenses(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getPurchaseExpenses(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('integrations/finance/consumption-expenses')
  @ApiOperation({ summary: 'Get inventory consumption expenses' })
  async getConsumptionExpenses(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getConsumptionExpenses(
      tenantId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get('integrations/finance/supplier-payments')
  @ApiOperation({ summary: 'Get supplier payment summary' })
  async getSupplierPaymentSummary(
    @Headers('x-tenant-id') tenantId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getSupplierPaymentSummary(tenantId);
  }

  @Get('integrations/finance/monthly-summary')
  @ApiOperation({ summary: 'Get monthly inventory expense summary' })
  async getMonthlyExpenseSummary(
    @Headers('x-tenant-id') tenantId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.inventoryService.getMonthlyExpenseSummary(
      tenantId,
      parseInt(year),
      parseInt(month),
    );
  }
}
