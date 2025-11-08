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
import { LaboratoryService } from './laboratory.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('laboratory')
@ApiBearerAuth()
@Controller('laboratory')
@UseGuards(JwtAuthGuard)
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create lab test order' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createLabTestDto: CreateLabTestDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.laboratoryService.create(tenantId, createLabTestDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab tests' })
  @ApiResponse({ status: 200, description: 'List of lab tests' })
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
    return this.laboratoryService.findAll(tenantId, page, limit, search, status, patientId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get laboratory statistics' })
  @ApiResponse({ status: 200, description: 'Laboratory statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.laboratoryService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single lab test' })
  @ApiResponse({ status: 200, description: 'Lab test details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.laboratoryService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lab test' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateLabTestDto: UpdateLabTestDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.laboratoryService.update(tenantId, id, updateLabTestDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete lab test' })
  @ApiResponse({ status: 200, description: 'Lab test deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.laboratoryService.remove(tenantId, id);
  }
}
