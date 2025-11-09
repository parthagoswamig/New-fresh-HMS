import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('Finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Create manual finance transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.financeService.create(tenantId, userId, createTransactionDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Get all finance transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'sourceModule', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: string,
    @Query('sourceModule') sourceModule?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.financeService.findAll(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      type,
      sourceModule,
      category,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get finance statistics' })
  @ApiResponse({ status: 200, description: 'Finance statistics' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.financeService.getStats(tenantId, startDate, endDate);
  }

  @Get('transactions/:id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.financeService.findOne(tenantId, id);
  }

  @Patch('transactions/:id')
  @ApiOperation({ summary: 'Update manual transaction' })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.financeService.update(tenantId, id, updateTransactionDto);
  }

  @Delete('transactions/:id')
  @ApiOperation({ summary: 'Delete manual transaction' })
  @ApiResponse({ status: 200, description: 'Transaction deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.financeService.remove(tenantId, id);
  }
}
