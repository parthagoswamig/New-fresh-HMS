import { IsString, IsDateString, IsArray, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClaimServiceDto {
  @ApiProperty({ description: 'Service ID' })
  @IsString()
  serviceId: string;

  @ApiProperty({ description: 'Service name' })
  @IsString()
  serviceName: string;

  @ApiProperty({ description: 'Service type', example: 'LAB' })
  @IsString()
  serviceType: string;

  @ApiProperty({ description: 'Service cost' })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateClaimDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Insurance policy ID' })
  @IsString()
  policyId: string;

  @ApiPropertyOptional({ description: 'Bill ID (if linked to existing bill)' })
  @IsString()
  @IsOptional()
  billId?: string;

  @ApiProperty({ description: 'Service date', example: '2024-11-08' })
  @IsDateString()
  serviceDate: string;

  @ApiProperty({ 
    description: 'List of services to claim',
    type: [ClaimServiceDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClaimServiceDto)
  services: ClaimServiceDto[];

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
