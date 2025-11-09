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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { SurgeryService } from './surgery.service';
import { CreateSurgeryDto } from './dto/create-surgery.dto';
import { UpdateSurgeryDto } from './dto/update-surgery.dto';

@ApiTags('Surgery')
@Controller('surgery')
export class SurgeryController {
  constructor(private readonly surgeryService: SurgeryService) {}

  @Post()
  @ApiOperation({ summary: 'Create new surgery' })
  @ApiResponse({ status: 201, description: 'Surgery created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Body() createSurgeryDto: CreateSurgeryDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.surgeryService.create(tenantId, userId, createSurgeryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all surgeries' })
  @ApiResponse({ status: 200, description: 'List of surgeries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'surgeryType', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('surgeryType') surgeryType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.surgeryService.findAll(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
      status,
      surgeryType,
      startDate,
      endDate,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get surgery statistics' })
  @ApiResponse({ status: 200, description: 'Surgery statistics' })
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
    return this.surgeryService.getStats(tenantId, startDate, endDate);
  }

  @Get('operating-rooms')
  @ApiOperation({ summary: 'Get all operating rooms' })
  @ApiResponse({ status: 200, description: 'List of operating rooms' })
  listOTs(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.surgeryService.listOTs(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get surgery by ID' })
  @ApiResponse({ status: 200, description: 'Surgery details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.surgeryService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update surgery' })
  @ApiResponse({ status: 200, description: 'Surgery updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateSurgeryDto: UpdateSurgeryDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.surgeryService.update(tenantId, id, updateSurgeryDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update surgery status' })
  @ApiResponse({ status: 200, description: 'Status updated successfully' })
  updateStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.surgeryService.updateStatus(tenantId, id, status, userId);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel surgery' })
  @ApiResponse({ status: 200, description: 'Surgery cancelled successfully' })
  cancel(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.surgeryService.cancel(tenantId, id, reason, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete surgery' })
  @ApiResponse({ status: 200, description: 'Surgery deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.surgeryService.remove(tenantId, id);
  }
}
