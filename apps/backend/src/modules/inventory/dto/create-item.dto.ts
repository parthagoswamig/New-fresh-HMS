import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
} from 'class-validator';

export enum ItemCategory {
  MEDICINE = 'MEDICINE',
  CONSUMABLE = 'CONSUMABLE',
  EQUIPMENT = 'EQUIPMENT',
  SURGICAL = 'SURGICAL',
  LABORATORY = 'LABORATORY',
  GENERAL = 'GENERAL',
}

export class CreateItemDto {
  @ApiProperty({ example: 'ITM-001' })
  @IsString()
  @IsOptional()
  itemCode?: string;

  @ApiProperty({ example: 'Paracetamol 500mg' })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({ enum: ItemCategory, example: ItemCategory.MEDICINE })
  @IsEnum(ItemCategory)
  @IsNotEmpty()
  category: ItemCategory;

  @ApiPropertyOptional({ example: 'Analgesics' })
  @IsString()
  @IsOptional()
  subcategory?: string;

  @ApiProperty({ example: 'Strip' })
  @IsString()
  @IsNotEmpty()
  unit: string;

  @ApiPropertyOptional({
    example: { box: 10, strip: 1 },
    description: 'Unit conversion mapping',
  })
  @IsOptional()
  unitConversion?: any;

  @ApiProperty({ example: 10, description: 'Minimum stock level before reorder' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number;

  @ApiProperty({ example: 5, description: 'Tax percentage' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;

  @ApiPropertyOptional({ example: 'Cipla' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiPropertyOptional({ example: 'supplier-id' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'Pain relief medication' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: ['dept-1', 'dept-2'],
    description: 'Department IDs with access to this item',
  })
  @IsArray()
  @IsOptional()
  departmentAccess?: string[];

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
