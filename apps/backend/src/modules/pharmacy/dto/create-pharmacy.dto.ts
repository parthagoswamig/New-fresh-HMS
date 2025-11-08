import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePharmacyDto {
  @ApiProperty({ description: 'Medicine name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Brand name' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ description: 'Batch number' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiProperty({ description: 'Quantity in stock' })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'tablets' })
  @IsString()
  unit: string;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @ApiPropertyOptional({ description: 'Medicine description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Generic name' })
  @IsString()
  @IsOptional()
  genericName?: string;

  @ApiPropertyOptional({ description: 'Manufacturer' })
  @IsString()
  @IsOptional()
  manufacturer?: string;

  @ApiPropertyOptional({ description: 'Category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Reorder level', default: 10 })
  @IsNumber()
  @IsOptional()
  reorderLevel?: number;
}
