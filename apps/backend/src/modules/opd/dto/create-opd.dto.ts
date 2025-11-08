import { IsString, IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOpdDto {
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

  @ApiProperty({ description: 'Visit date' })
  @IsDateString()
  visitDate: string;

  @ApiProperty({ description: 'Chief complaint/reason for visit' })
  @IsString()
  chiefComplaint: string;

  @ApiPropertyOptional({ description: 'Diagnosis' })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Consultation fee', example: 500 })
  @IsNumber()
  @Min(0)
  fee: number;

  @ApiPropertyOptional({ description: 'Status', example: 'PENDING' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Vitals (JSON)', example: { bp: '120/80', temp: '98.6' } })
  @IsOptional()
  vitals?: any;
}
