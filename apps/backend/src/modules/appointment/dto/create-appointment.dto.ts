import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Appointment date' })
  @IsDateString()
  appointmentDate: string;

  @ApiProperty({ description: 'Appointment time', example: '10:00 AM' })
  @IsString()
  appointmentTime: string;

  @ApiPropertyOptional({ description: 'Reason for appointment' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Appointment status', example: 'PENDING' })
  @IsString()
  @IsOptional()
  status?: string;
}
