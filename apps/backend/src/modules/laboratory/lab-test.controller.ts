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
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { LabTestService, CreateLabTestMasterDto, UpdateLabTestMasterDto } from './lab-test.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('lab-tests')
@ApiBearerAuth()
@Controller('lab-tests')
@UseGuards(JwtAuthGuard)
export class LabTestController {
  constructor(private readonly labTestService: LabTestService) {}

  @Post()
  @ApiOperation({ summary: 'Create new lab test master' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDto: CreateLabTestMasterDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.createTest(tenantId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all lab test masters' })
  @ApiResponse({ status: 200, description: 'List of lab tests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.findAllTests(tenantId, page, limit, search, category, isActive);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get lab test statistics' })
  @ApiResponse({ status: 200, description: 'Lab test statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.getTestStats(tenantId);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all lab test categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  getCategories(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.getCategories(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single lab test master' })
  @ApiResponse({ status: 200, description: 'Lab test details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.findOneTest(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update lab test master' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateDto: UpdateLabTestMasterDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.updateTest(tenantId, id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete (deactivate) lab test master' })
  @ApiResponse({ status: 200, description: 'Lab test deactivated successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.labTestService.removeTest(tenantId, id);
  }
}
