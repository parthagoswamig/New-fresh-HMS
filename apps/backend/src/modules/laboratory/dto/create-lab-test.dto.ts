import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Lab test ID from catalog' })
  @IsUUID()
  labTestId: string;

  @ApiProperty({ description: 'Ordered by staff ID' })
  @IsUUID()
  orderedById: string;

  @ApiProperty({ description: 'Test name' })
  @IsString()
  testName: string;

  @ApiPropertyOptional({ description: 'Test code' })
  @IsString()
  @IsOptional()
  testCode?: string;

  @ApiPropertyOptional({ description: 'Sample type (Blood, Urine, etc.)' })
  @IsString()
  @IsOptional()
  sampleType?: string;

  @ApiPropertyOptional({ description: 'Test result' })
  @IsString()
  @IsOptional()
  result?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Reference range' })
  @IsString()
  @IsOptional()
  referenceRange?: string;

  @ApiPropertyOptional({ description: 'Status', enum: ['ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  @IsEnum(['ORDERED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'OPD Visit ID' })
  @IsUUID()
  @IsOptional()
  opdVisitId?: string;

  @ApiPropertyOptional({ description: 'IPD Admission ID' })
  @IsUUID()
  @IsOptional()
  ipdAdmissionId?: string;
}
