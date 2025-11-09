import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class RequisitionItemDto {
  @ApiProperty({ example: 'item-id' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  requestedQuantity: number;
}

export class CreateRequisitionDto {
  @ApiProperty({ example: 'dept-id' })
  @IsString()
  @IsNotEmpty()
  departmentId: string;

  @ApiProperty({ type: [RequisitionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RequisitionItemDto)
  items: RequisitionItemDto[];

  @ApiPropertyOptional({ example: 'Urgent requirement for OT' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  requestedById: string;
}

export class ApproveRequisitionDto {
  @ApiProperty({ example: 'requisition-id' })
  @IsString()
  @IsNotEmpty()
  requisitionId: string;

  @ApiProperty({
    example: [{ itemId: 'item-id', approvedQuantity: 40 }],
    description: 'Approved quantities for each item',
  })
  @IsArray()
  approvedItems: Array<{ itemId: string; approvedQuantity: number }>;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  approvedById: string;
}

export class IssueStockDto {
  @ApiProperty({ example: 'requisition-id' })
  @IsString()
  @IsNotEmpty()
  requisitionId: string;

  @ApiProperty({
    example: [{ itemId: 'item-id', issuedQuantity: 40, batchNumber: 'BATCH-001' }],
    description: 'Issued quantities with batch numbers',
  })
  @IsArray()
  issuedItems: Array<{
    itemId: string;
    issuedQuantity: number;
    batchNumber: string;
  }>;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  issuedById: string;
}
