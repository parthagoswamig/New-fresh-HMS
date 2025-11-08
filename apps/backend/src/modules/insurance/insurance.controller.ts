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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InsuranceCompanyService } from './insurance-company.service';
import { InsurancePolicyService } from './insurance-policy.service';
import { PatientInsuranceService } from './patient-insurance.service';
import { InsuranceClaimService } from './insurance-claim.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';
import { AssignInsuranceDto } from './dto/assign-insurance.dto';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimStatusDto } from './dto/update-claim-status.dto';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('insurance')
@ApiBearerAuth()
@Controller('insurance')
@UseGuards(JwtAuthGuard)
export class InsuranceController {
  constructor(
    private readonly companyService: InsuranceCompanyService,
    private readonly policyService: InsurancePolicyService,
    private readonly patientInsuranceService: PatientInsuranceService,
    private readonly claimService: InsuranceClaimService,
  ) {}

  // ==================== INSURANCE COMPANIES ====================

  @Post('companies')
  @ApiOperation({ summary: 'Create insurance company' })
  @ApiResponse({ status: 201, description: 'Company created successfully' })
  createCompany(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.create(tenantId, createCompanyDto);
  }

  @Get('companies')
  @ApiOperation({ summary: 'Get all insurance companies' })
  @ApiResponse({ status: 200, description: 'List of companies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllCompanies(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.findAll(tenantId, page, limit, search);
  }

  @Get('companies/:id')
  @ApiOperation({ summary: 'Get company by ID' })
  @ApiResponse({ status: 200, description: 'Company details' })
  findOneCompany(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.findOne(tenantId, id);
  }

  @Patch('companies/:id')
  @ApiOperation({ summary: 'Update company' })
  @ApiResponse({ status: 200, description: 'Company updated successfully' })
  updateCompany(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.update(tenantId, id, updateCompanyDto);
  }

  @Delete('companies/:id')
  @ApiOperation({ summary: 'Delete company' })
  @ApiResponse({ status: 200, description: 'Company deleted successfully' })
  removeCompany(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.remove(tenantId, id);
  }

  // ==================== INSURANCE POLICIES ====================

  @Post('policies')
  @ApiOperation({ summary: 'Create insurance policy' })
  @ApiResponse({ status: 201, description: 'Policy created successfully' })
  createPolicy(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createPolicyDto: CreatePolicyDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.policyService.create(tenantId, createPolicyDto);
  }

  @Get('policies')
  @ApiOperation({ summary: 'Get all insurance policies' })
  @ApiResponse({ status: 200, description: 'List of policies' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'companyId', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  findAllPolicies(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('companyId') companyId?: string,
    @Query('search') search?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.policyService.findAll(tenantId, page, limit, companyId, search);
  }

  @Get('policies/:id')
  @ApiOperation({ summary: 'Get policy by ID' })
  @ApiResponse({ status: 200, description: 'Policy details' })
  findOnePolicy(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.policyService.findOne(tenantId, id);
  }

  @Patch('policies/:id')
  @ApiOperation({ summary: 'Update policy' })
  @ApiResponse({ status: 200, description: 'Policy updated successfully' })
  updatePolicy(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updatePolicyDto: UpdatePolicyDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.policyService.update(tenantId, id, updatePolicyDto);
  }

  @Delete('policies/:id')
  @ApiOperation({ summary: 'Delete policy' })
  @ApiResponse({ status: 200, description: 'Policy deleted successfully' })
  removePolicy(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.policyService.remove(tenantId, id);
  }

  // ==================== PATIENT INSURANCE ====================

  @Post('patient-insurance')
  @ApiOperation({ summary: 'Assign insurance to patient' })
  @ApiResponse({ status: 201, description: 'Insurance assigned successfully' })
  assignInsurance(
    @Headers('x-tenant-id') tenantId: string,
    @Body() assignInsuranceDto: AssignInsuranceDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.patientInsuranceService.assignToPatient(tenantId, assignInsuranceDto);
  }

  @Get('patient-insurance/patient/:patientId')
  @ApiOperation({ summary: 'Get patient insurance records' })
  @ApiResponse({ status: 200, description: 'List of patient insurance' })
  findPatientInsurance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.patientInsuranceService.findByPatient(tenantId, patientId);
  }

  @Get('patient-insurance/patient/:patientId/active')
  @ApiOperation({ summary: 'Get active patient insurance' })
  @ApiResponse({ status: 200, description: 'Active insurance records' })
  findActivePatientInsurance(
    @Headers('x-tenant-id') tenantId: string,
    @Param('patientId') patientId: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.patientInsuranceService.findActiveByPatient(tenantId, patientId);
  }

  // ==================== INSURANCE CLAIMS ====================

  @Post('claims')
  @ApiOperation({ summary: 'Create insurance claim' })
  @ApiResponse({ status: 201, description: 'Claim created successfully' })
  createClaim(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Request() req: any,
    @Body() createClaimDto: CreateClaimDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const staffId = userId || req.user?.staffId || req.user?.sub || req.user?.id;
    if (!staffId) {
      throw new BadRequestException('User ID is required');
    }

    return this.claimService.create(tenantId, staffId, createClaimDto);
  }

  @Get('claims')
  @ApiOperation({ summary: 'Get all claims' })
  @ApiResponse({ status: 200, description: 'List of claims' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  findAllClaims(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.claimService.findAll(tenantId, page, limit, status, patientId);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiResponse({ status: 200, description: 'Claim details' })
  findOneClaim(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.claimService.findOne(tenantId, id);
  }

  @Patch('claims/:id/status')
  @ApiOperation({ summary: 'Update claim status' })
  @ApiResponse({ status: 200, description: 'Claim status updated successfully' })
  updateClaimStatus(
    @Headers('x-tenant-id') tenantId: string,
    @Headers('x-user-id') userId: string,
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateClaimStatusDto,
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }

    const staffId = userId || req.user?.staffId || req.user?.sub || req.user?.id;
    if (!staffId) {
      throw new BadRequestException('User ID is required');
    }

    return this.claimService.updateStatus(tenantId, id, staffId, updateStatusDto);
  }

  @Post('claims/:id/documents')
  @ApiOperation({ summary: 'Add documents to claim' })
  @ApiResponse({ status: 200, description: 'Documents added successfully' })
  addClaimDocuments(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() documents: UploadDocumentDto[],
  ) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.claimService.addDocuments(tenantId, id, documents);
  }

  // ==================== STATISTICS ====================

  @Get('stats/companies')
  @ApiOperation({ summary: 'Get company statistics' })
  @ApiResponse({ status: 200, description: 'Company statistics' })
  getCompanyStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.companyService.getStats(tenantId);
  }

  @Get('stats/claims')
  @ApiOperation({ summary: 'Get claim statistics' })
  @ApiResponse({ status: 200, description: 'Claim statistics' })
  getClaimStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID is required');
    }
    return this.claimService.getStats(tenantId);
  }
}
