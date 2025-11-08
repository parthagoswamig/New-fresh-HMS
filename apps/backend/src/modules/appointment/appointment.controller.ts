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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @ApiOperation({ summary: 'Create new appointment' })
  @ApiResponse({ status: 201, description: 'Appointment created successfully' })
  create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.create(tenantId, createAppointmentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all appointments' })
  @ApiResponse({ status: 200, description: 'List of appointments' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'patientId', required: false, type: String })
  @ApiQuery({ name: 'doctorId', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  findAll(
    @Headers('x-tenant-id') tenantId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('search') search?: string,
    @Query('patientId') patientId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('date') date?: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.findAll(
      tenantId,
      page,
      limit,
      search,
      patientId,
      doctorId,
      status,
      date,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get appointment statistics' })
  @ApiResponse({ status: 200, description: 'Appointment statistics' })
  getStats(@Headers('x-tenant-id') tenantId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.getStats(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single appointment' })
  @ApiResponse({ status: 200, description: 'Appointment details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.findOne(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment' })
  @ApiResponse({ status: 200, description: 'Appointment updated successfully' })
  update(
    @Headers('x-tenant-id') tenantId: string,
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.update(tenantId, id, updateAppointmentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete appointment' })
  @ApiResponse({ status: 200, description: 'Appointment deleted successfully' })
  remove(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.appointmentService.remove(tenantId, id);
  }
}
