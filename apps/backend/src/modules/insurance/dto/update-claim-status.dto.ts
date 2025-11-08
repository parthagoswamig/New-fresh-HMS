import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ClaimStatusEnum {
  INITIATED = 'INITIATED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

export class UpdateClaimStatusDto {
  @ApiProperty({ 
    description: 'New claim status',
    enum: ClaimStatusEnum,
    example: ClaimStatusEnum.APPROVED
  })
  @IsEnum(ClaimStatusEnum)
  status: ClaimStatusEnum;

  @ApiPropertyOptional({ description: 'Review notes or comments' })
  @IsString()
  @IsOptional()
  reviewNotes?: string;

  @ApiPropertyOptional({ description: 'Rejection reason (if status is REJECTED)' })
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
