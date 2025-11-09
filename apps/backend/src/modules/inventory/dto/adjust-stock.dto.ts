import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
} from 'class-validator';

export enum AdjustmentReason {
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
  THEFT = 'THEFT',
  SAMPLE = 'SAMPLE',
  EXPIRED = 'EXPIRED',
  CORRECTION = 'CORRECTION',
  OTHER = 'OTHER',
}

export class AdjustStockDto {
  @ApiProperty({ example: 'item-id' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiPropertyOptional({ example: 'dept-id' })
  @IsString()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'BATCH-001' })
  @IsString()
  @IsOptional()
  batchNumber?: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  quantityBefore: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  quantityAfter: number;

  @ApiProperty({ enum: AdjustmentReason, example: AdjustmentReason.DAMAGE })
  @IsEnum(AdjustmentReason)
  reason: AdjustmentReason;

  @ApiPropertyOptional({ example: '5 units damaged during handling' })
  @IsString()
  @IsOptional()
  reasonNotes?: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  adjustedById: string;
}
