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
import { IpdService } from './ipd.service';
import { CreateIpdDto } from './dto/create-ipd.dto';
import { UpdateIpdDto } from './dto/update-ipd.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('ipd')
@ApiBearerAuth()
@Controller('ipd')
@UseGuards(JwtAuthGuard)
export class IpdController {
  constructor(private readonly ipdService: IpdService) {}

  @Post()
  @ApiOperation({ summary: 'Create new IPD admission' })
  @ApiResponse({ status: 201, description: 'IPD admission created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createIpdDto: CreateIpdDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.ipdService.create(tenantId, createIpdDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all IPD admissions' })
  @ApiResponse({ status: 200, description: 'List of IPD admissions' })
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
    return this.ipdService.findAll(
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
  @ApiOperation({ summary: 'Get IPD statistics' })
  @ApiResponse({ status: 200, description: 'IPD statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.ipdService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single IPD admission' })
  @ApiResponse({ status: 200, description: 'IPD admission details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.ipdService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update IPD admission' })
  @ApiResponse({ status: 200, description: 'IPD admission updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateIpdDto: UpdateIpdDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.ipdService.update(tenantId, id, updateIpdDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete IPD admission' })
  @ApiResponse({ status: 200, description: 'IPD admission deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.ipdService.remove(tenantId, id);
  }
}
