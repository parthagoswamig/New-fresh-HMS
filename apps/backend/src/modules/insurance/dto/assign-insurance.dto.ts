import { IsString, IsDateString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignInsuranceDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Insurance policy ID' })
  @IsString()
  policyId: string;

  @ApiProperty({ description: 'Policy number' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ description: 'Coverage start date', example: '2024-01-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'Coverage end date', example: '2025-12-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ description: 'Total coverage amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  coverageAmount?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
