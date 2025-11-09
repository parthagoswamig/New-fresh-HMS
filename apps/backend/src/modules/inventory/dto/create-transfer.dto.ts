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

export class TransferItemDto {
  @ApiProperty({ example: 'item-id' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateTransferDto {
  @ApiProperty({ example: 'from-dept-id' })
  @IsString()
  @IsNotEmpty()
  fromDepartmentId: string;

  @ApiProperty({ example: 'to-dept-id' })
  @IsString()
  @IsNotEmpty()
  toDepartmentId: string;

  @ApiProperty({ type: [TransferItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items: TransferItemDto[];

  @ApiPropertyOptional({ example: 'Transfer for emergency use' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  requestedById: string;
}

export class ApproveTransferDto {
  @ApiProperty({ example: 'transfer-id' })
  @IsString()
  @IsNotEmpty()
  transferId: string;

  @ApiProperty({ example: 'staff-id' })
  @IsString()
  @IsNotEmpty()
  approvedById: string;
}
