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
} from '@nestjs/common';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('departments')
@UseGuards(JwtAuthGuard)
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createDepartmentDto: CreateDepartmentDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.departmentService.create(tenantId, createDepartmentDto);
  }

  @Get()
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('isActive') isActive?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.departmentService.findAll(tenantId, isActiveBool);
  }

  @Get(':id')
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.departmentService.findOne(tenantId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.departmentService.update(tenantId, id, updateDepartmentDto);
  }

  @Delete(':id')
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.departmentService.remove(tenantId, id);
  }
}
