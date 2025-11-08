import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Lab test ID from catalog' })
  @IsString()
  labTestId: string;

  @ApiProperty({ description: 'Ordered by staff ID' })
  @IsString()
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
  @IsString()
  @IsOptional()
  opdVisitId?: string;

  @ApiPropertyOptional({ description: 'IPD Admission ID' })
  @IsString()
  @IsOptional()
  ipdAdmissionId?: string;
}
