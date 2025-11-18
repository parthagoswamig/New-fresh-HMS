import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PrescriptionService } from './prescription.service';
import { UpsertAppointmentPrescriptionDto } from './dto/upsert-appointment-prescription.dto';

@ApiTags('prescriptions')
@ApiBearerAuth()
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Get('appointment/:appointmentId')
  @ApiOperation({ summary: 'Get prescription for an appointment' })
  @ApiResponse({ status: 200, description: 'Prescription details' })
  getByAppointment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('appointmentId') appointmentId: string,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.prescriptionService.getByAppointment(tenantId, appointmentId);
  }

  @Post('appointment/:appointmentId')
  @ApiOperation({ summary: 'Create or update prescription for an appointment' })
  @ApiResponse({ status: 200, description: 'Prescription saved successfully' })
  upsertForAppointment(
    @Headers('x-tenant-id') tenantId: string,
    @Param('appointmentId') appointmentId: string,
    @Body() dto: UpsertAppointmentPrescriptionDto,
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.prescriptionService.upsertForAppointment(tenantId, appointmentId, dto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get all prescriptions for a patient' })
  @ApiResponse({ status: 200, description: 'List of prescriptions' })
  listByPatient(@Headers('x-tenant-id') tenantId: string, @Param('patientId') patientId: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.prescriptionService.listByPatient(tenantId, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single prescription by ID' })
  @ApiResponse({ status: 200, description: 'Prescription details' })
  findOne(@Headers('x-tenant-id') tenantId: string, @Param('id') id: string) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    return this.prescriptionService.findOne(tenantId, id);
  }
}
