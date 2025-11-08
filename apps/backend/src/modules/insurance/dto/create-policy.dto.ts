import { IsString, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePolicyDto {
  @ApiProperty({ description: 'Insurance company ID' })
  @IsString()
  companyId: string;

  @ApiProperty({ description: 'Policy name', example: 'Family Health Plus' })
  @IsString()
  policyName: string;

  @ApiProperty({ description: 'Policy number', example: 'POL-2024-001' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ description: 'Policy type', example: 'Health' })
  @IsString()
  policyType: string;

  @ApiProperty({ 
    description: 'Coverage percentage (0-100)', 
    example: 80,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  coveragePercent: number;

  @ApiProperty({ description: 'Deductible amount', example: 500 })
  @IsNumber()
  @Min(0)
  deductible: number;

  @ApiPropertyOptional({ description: 'Maximum coverage amount' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxCoverage?: number;

  @ApiProperty({ description: 'Policy valid from date', example: '2024-01-01' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Policy valid until date', example: '2025-12-31' })
  @IsDateString()
  validUntil: string;

  @ApiPropertyOptional({ description: 'Policy terms and conditions' })
  @IsString()
  @IsOptional()
  terms?: string;
}
