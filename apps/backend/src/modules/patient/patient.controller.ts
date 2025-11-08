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
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('patients')
@ApiBearerAuth()
@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Register new patient' })
  @ApiResponse({ status: 201, description: 'Patient registered successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.create(tenantId, createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.findAll(tenantId, page, limit, search, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get patient statistics' })
  @ApiResponse({ status: 200, description: 'Patient statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single patient' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.update(tenantId, id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.patientService.remove(tenantId, id);
  }
}
