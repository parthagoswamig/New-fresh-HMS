import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Headers,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LabEntryService } from './lab-entry.service';
import { CreateLabEntryDto } from './dto/create-lab-entry.dto';
import { AddLabResultsDto } from './dto/add-lab-results.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('lab-entries')
@ApiBearerAuth()
@Controller('lab-entries')
@UseGuards(JwtAuthGuard)
export class LabEntryController {
  constructor(private readonly labEntryService: LabEntryService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lab entry' })
  @ApiResponse({ status: 201, description: 'Lab entry created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Request() req: any,
    @Body() createLabEntryDto: CreateLabEntryDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    const userId = req.user?.staffId || req.user?.sub;
    return this.labEntryService.createEntry(tenantId, userId, createLabEntryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab entries' })
  @ApiResponse({ status: 200, description: 'List of lab entries' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.findAll(tenantId, page, limit, search, patientId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lab entry statistics' })
  @ApiResponse({ status: 200, description: 'Lab entry statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab entry by ID' })
  @ApiResponse({ status: 200, description: 'Lab entry details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.findOne(tenantId, id);
  }

  @Post(':id/results')
  @ApiOperation({ summary: 'Add test results to lab entry' })
  @ApiResponse({ status: 200, description: 'Results added successfully' })
  addResults(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Request() req: any,
    @Body() addLabResultsDto: AddLabResultsDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    const userId = req.user?.staffId || req.user?.sub;
    return this.labEntryService.addResults(tenantId, id, userId, addLabResultsDto);
  }

  @Get(':id/print')
  @ApiOperation({ summary: 'Get printable lab report data' })
  @ApiResponse({ status: 200, description: 'Printable report data' })
  getPrintData(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.getPrintData(tenantId, id);
  }

  @Post(':id/bill')
  @ApiOperation({ summary: 'Create bill for lab entry' })
  @ApiResponse({ status: 200, description: 'Bill created successfully' })
  createBill(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.createBillForEntry(tenantId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lab entry' })
  @ApiResponse({ status: 200, description: 'Lab entry deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labEntryService.remove(tenantId, id);
  }
}
