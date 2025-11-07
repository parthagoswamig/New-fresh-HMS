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
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createStaffDto: CreateStaffDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.staffService.create(tenantId, createStaffDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.staffService.findAll(
      tenantId,
      page,
      limit,
      search,
      departmentId,
      role,
      isActiveBool,
    );
  }

  @Get('stats')
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.staffService.getStats(tenantId);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.staffService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.staffService.update(tenantId, id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.staffService.remove(tenantId, id);
  }
}
