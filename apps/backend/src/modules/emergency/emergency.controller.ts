import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { UpdateEmergencyDto, EmergencyStatus } from './dto/update-emergency.dto';

@ApiTags('Emergency')
@Controller('emergency')
@ApiHeader({ name: 'x-tenant-id', required: true })
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  @ApiOperation({ summary: 'Create new emergency case' })
  @ApiResponse({ status: 201, description: 'Emergency case created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateEmergencyDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.create(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all emergency cases' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: EmergencyStatus })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Emergency cases retrieved successfully' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: EmergencyStatus,
    @Query('severity') severity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.findAll(
      tenantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      { search, status, severity, startDate, endDate },
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get emergency statistics' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiResponse({ status: 200, description: 'Emergency statistics' })
  getStats(
    @Headers('x-tenant-id') tenantId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.getStats(tenantId, startDate, endDate);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get emergency case by ID' })
  @ApiResponse({ status: 200, description: 'Emergency case retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Emergency case not found' })
  findOne(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update emergency case' })
  @ApiResponse({ status: 200, description: 'Emergency case updated successfully' })
  @ApiResponse({ status: 404, description: 'Emergency case not found' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmergencyDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.update(tenantId, id, updateDto);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer emergency case to IPD' })
  @ApiResponse({ status: 200, description: 'Emergency case transferred successfully' })
  @HttpCode(HttpStatus.OK)
  transferToIpd(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() body: { ipdAdmissionId: string; updatedById: string },
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.transferToIpd(
      tenantId,
      id,
      body.ipdAdmissionId,
      body.updatedById,
    );
  }

  @Post(':id/discharge')
  @ApiOperation({ summary: 'Discharge emergency case' })
  @ApiResponse({ status: 200, description: 'Emergency case discharged successfully' })
  @HttpCode(HttpStatus.OK)
  discharge(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      dischargeSummary: string;
      dischargeAdvice?: string;
      followUpDate?: string;
      updatedById: string;
    },
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.discharge(tenantId, id, body);
  }

  @Post(':id/death')
  @ApiOperation({ summary: 'Declare death for emergency case' })
  @ApiResponse({ status: 200, description: 'Death declared successfully' })
  @HttpCode(HttpStatus.OK)
  declareDeath(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body()
    body: {
      causeOfDeath: string;
      deathTime?: string;
      deathCertificateUrl?: string;
      updatedById: string;
    },
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.declareDeath(tenantId, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete emergency case (WAITING status only)' })
  @ApiResponse({ status: 200, description: 'Emergency case deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete non-waiting cases' })
  remove(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.emergencyService.remove(tenantId, id);
  }
}
