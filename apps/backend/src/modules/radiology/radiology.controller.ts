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
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RadiologyService } from './radiology.service';
import { CreateRadiologyTestDto } from './dto/create-radiology-test.dto';
import { UpdateRadiologyTestDto } from './dto/update-radiology-test.dto';
import { AssignTestDto } from './dto/assign-test.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('radiology')
@ApiBearerAuth()
@Controller('radiology')
@UseGuards(JwtAuthGuard)
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  // ==================== RADIOLOGY TEST MANAGEMENT ====================

  @Post('tests')
  @ApiOperation({ summary: 'Create new radiology test template' })
  @ApiResponse({ status: 201, description: 'Test created successfully' })
  createTest(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createRadiologyTestDto: CreateRadiologyTestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.createTest(tenantId, createRadiologyTestDto);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Get all radiology tests' })
  @ApiResponse({ status: 200, description: 'List of radiology tests' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllTests(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.findAllTests(tenantId, page, limit, search);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get radiology test by ID' })
  @ApiResponse({ status: 200, description: 'Radiology test details' })
  findTestById(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.findTestById(tenantId, id);
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Update radiology test' })
  @ApiResponse({ status: 200, description: 'Test updated successfully' })
  updateTest(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateRadiologyTestDto: UpdateRadiologyTestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.updateTest(tenantId, id, updateRadiologyTestDto);
  }

  @Delete('tests/:id')
  @ApiOperation({ summary: 'Delete radiology test' })
  @ApiResponse({ status: 200, description: 'Test deleted successfully' })
  deleteTest(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.deleteTest(tenantId, id);
  }

  // ==================== PATIENT RADIOLOGY MANAGEMENT ====================

  @Post('assign')
  @ApiOperation({ summary: 'Assign radiology test to patient' })
  @ApiResponse({ status: 201, description: 'Test assigned successfully' })
  assignTest(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Request() req: any,
    @Body() assignTestDto: AssignTestDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    
    const staffId = userId || req.user?.staffId || req.user?.sub || req.user?.id;
    if (!staffId) {
      throw new BadRequestException('User ID is required');
    }
    
    return this.radiologyService.assignTest(tenantId, staffId, assignTestDto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all radiology tests for a patient' })
  @ApiResponse({ status: 200, description: 'List of patient radiology tests' })
  findPatientTests(
    @Headers('x-tenant-id') tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.findPatientTests(tenantId, patientId);
  }

  @Patch('result/:id')
  @ApiOperation({ summary: 'Update radiology test result' })
  @ApiResponse({ status: 200, description: 'Result updated successfully' })
  updateResult(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateResultDto: UpdateResultDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.updateResult(tenantId, id, updateResultDto);
  }

  @Get('report/:id')
  @ApiOperation({ summary: 'Get radiology report' })
  @ApiResponse({ status: 200, description: 'Radiology report data' })
  getReport(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.getReport(tenantId, id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get radiology statistics' })
  @ApiResponse({ status: 200, description: 'Radiology statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.radiologyService.getStats(tenantId);
  }
}
