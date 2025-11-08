import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { CreateBillingDto } from './dto/create-billing.dto';
import { UpdateBillingDto } from './dto/update-billing.dto';
import { AddPaymentDto } from './dto/add-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('billing')
@ApiBearerAuth()
@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @ApiOperation({ summary: 'Create new invoice' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createBillingDto: CreateBillingDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.create(tenantId, createBillingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.findAll(tenantId, page, limit, search, status, patientId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get billing statistics' })
  @ApiResponse({ status: 200, description: 'Billing statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single invoice' })
  @ApiResponse({ status: 200, description: 'Invoice details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({ status: 200, description: 'Invoice updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateBillingDto: UpdateBillingDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.update(tenantId, id, updateBillingDto);
  }

  @Post(':id/payment')
  @ApiOperation({ summary: 'Add payment to invoice' })
  @ApiResponse({ status: 200, description: 'Payment added successfully' })
  addPayment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() addPaymentDto: AddPaymentDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.addPayment(tenantId, id, addPaymentDto);
  }

  @Patch(':id/finalize')
  @ApiOperation({ summary: 'Finalize invoice (lock from edits)' })
  @ApiResponse({ status: 200, description: 'Invoice finalized successfully' })
  finalize(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.finalizeBill(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({ status: 200, description: 'Invoice deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.billingService.remove(tenantId, id);
  }
}
