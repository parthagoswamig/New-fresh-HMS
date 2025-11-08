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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OpdService } from './opd.service';
import { CreateOpdDto } from './dto/create-opd.dto';
import { UpdateOpdDto } from './dto/update-opd.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('opd')
@ApiBearerAuth()
@Controller('opd')
@UseGuards(JwtAuthGuard)
export class OpdController {
  constructor(private readonly opdService: OpdService) {}

  @Post()
  @ApiOperation({ summary: 'Create new OPD visit' })
  @ApiResponse({ status: 201, description: 'OPD visit created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createOpdDto: CreateOpdDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.create(tenantId, createOpdDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all OPD visits' })
  @ApiResponse({ status: 200, description: 'List of OPD visits' })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.findAll(
      tenantId,
      page,
      limit,
      search,
      patientId,
      doctorId,
      departmentId,
      status,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get OPD statistics' })
  @ApiResponse({ status: 200, description: 'OPD statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single OPD visit' })
  @ApiResponse({ status: 200, description: 'OPD visit details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update OPD visit' })
  @ApiResponse({ status: 200, description: 'OPD visit updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateOpdDto: UpdateOpdDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.update(tenantId, id, updateOpdDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete OPD visit' })
  @ApiResponse({ status: 200, description: 'OPD visit deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.opdService.remove(tenantId, id);
  }
}
