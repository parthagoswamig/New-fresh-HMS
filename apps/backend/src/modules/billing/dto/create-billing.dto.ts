import { IsString, IsOptional, IsDateString, IsNumber, IsArray, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class BillItemDto {
  @ApiProperty({ description: 'Item description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Quantity' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Unit price' })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class CreateBillingDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsUUID()
  patientId: string;

  @ApiPropertyOptional({ description: 'Due date' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({ description: 'Bill items', type: [BillItemDto] })
  @IsArray()
  @Type(() => BillItemDto)
  items: BillItemDto[];

  @ApiPropertyOptional({ description: 'Discount amount' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsString()
  @IsOptional()
  status?: string;
}
