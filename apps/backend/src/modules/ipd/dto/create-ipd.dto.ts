import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIpdDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Doctor ID' })
  @IsString()
  doctorId: string;

  @ApiPropertyOptional({ description: 'Department ID' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ description: 'Bed ID' })
  @IsString()
  @IsOptional()
  bedId?: string;

  @ApiProperty({ description: 'Admission date' })
  @IsDateString()
  admissionDate: string;

  @ApiPropertyOptional({ description: 'Discharge date' })
  @IsDateString()
  @IsOptional()
  dischargeDate?: string;

  @ApiProperty({ description: 'Reason for admission' })
  @IsString()
  admissionReason: string;

  @ApiPropertyOptional({ description: 'Diagnosis' })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Treatment plan' })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiPropertyOptional({ description: 'Room number' })
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional({ description: 'Bed number' })
  @IsString()
  @IsOptional()
  bedNumber?: string;

  @ApiPropertyOptional({ description: 'Discharge summary' })
  @IsString()
  @IsOptional()
  dischargeSummary?: string;

  @ApiPropertyOptional({ description: 'Status', example: 'ADMITTED' })
  @IsString()
  @IsOptional()
  status?: string;
}
