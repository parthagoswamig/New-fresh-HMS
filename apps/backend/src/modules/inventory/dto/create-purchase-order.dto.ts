import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseOrderItemDto {
  @ApiProperty({ example: 'item-id' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 50.5 })
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ example: 5 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  tax?: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty({ example: 'supplier-id' })
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty({ type: [PurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];

  @ApiPropertyOptional({ example: '2024-12-31T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ example: 'Urgent order for pharmacy' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  createdById: string;
}
