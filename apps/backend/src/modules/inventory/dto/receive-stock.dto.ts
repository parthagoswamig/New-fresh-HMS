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

export class ReceiveStockItemDto {
  @ApiProperty({ example: 'po-item-id' })
  @IsString()
  @IsNotEmpty()
  poItemId: string;

  @ApiProperty({ example: 'item-id' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 'BATCH-001' })
  @IsString()
  @IsNotEmpty()
  batchNumber: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @Min(1)
  receivedQuantity: number;

  @ApiProperty({ example: 45.5 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  mrp?: number;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00Z' })
  @IsDateString()
  @IsOptional()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'dept-id' })
  @IsString()
  @IsOptional()
  departmentId?: string;
}

export class ReceiveStockDto {
  @ApiProperty({ example: 'po-id' })
  @IsString()
  @IsNotEmpty()
  purchaseOrderId: string;

  @ApiProperty({ type: [ReceiveStockItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveStockItemDto)
  items: ReceiveStockItemDto[];

  @ApiPropertyOptional({ example: 'INV-2024-001' })
  @IsString()
  @IsOptional()
  invoiceNumber?: string;

  @ApiPropertyOptional({ example: 'GRN-2024-001' })
  @IsString()
  @IsOptional()
  grnNumber?: string;

  @ApiPropertyOptional({ example: 'https://example.com/invoice.pdf' })
  @IsString()
  @IsOptional()
  invoiceUrl?: string;
}
