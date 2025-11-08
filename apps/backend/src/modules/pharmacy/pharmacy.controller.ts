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
import { PharmacyService } from './pharmacy.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('pharmacy')
@ApiBearerAuth()
@Controller('pharmacy')
@UseGuards(JwtAuthGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post()
  @ApiOperation({ summary: 'Add new medicine to inventory' })
  @ApiResponse({ status: 201, description: 'Medicine added successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createPharmacyDto: CreatePharmacyDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.create(tenantId, createPharmacyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines' })
  @ApiResponse({ status: 200, description: 'List of medicines' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'lowStock', required: false, type: Boolean })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('lowStock', new DefaultValuePipe(false), ParseBoolPipe) lowStock?: boolean,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.findAll(tenantId, page, limit, search, category, lowStock);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  @ApiResponse({ status: 200, description: 'Pharmacy statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single medicine details' })
  @ApiResponse({ status: 200, description: 'Medicine details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update medicine details' })
  @ApiResponse({ status: 200, description: 'Medicine updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updatePharmacyDto: UpdatePharmacyDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.update(tenantId, id, updatePharmacyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete medicine from inventory' })
  @ApiResponse({ status: 200, description: 'Medicine deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.pharmacyService.remove(tenantId, id);
  }
}
