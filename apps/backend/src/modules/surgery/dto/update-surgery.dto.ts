import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSurgeryDto, SurgeryStatusEnum } from './create-surgery.dto';
import { IsEnum, IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateSurgeryDto extends PartialType(CreateSurgeryDto) {
  @ApiPropertyOptional({ enum: SurgeryStatusEnum })
  @IsEnum(SurgeryStatusEnum)
  @IsOptional()
  status?: SurgeryStatusEnum;

  @ApiPropertyOptional({ description: 'Post-operative diagnosis' })
  @IsString()
  @IsOptional()
  postOpDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Post-operative notes' })
  @IsString()
  @IsOptional()
  postOpNote?: string;

  @ApiPropertyOptional({ description: 'Complications' })
  @IsString()
  @IsOptional()
  complications?: string;

  @ApiPropertyOptional({ description: 'Blood loss in ml' })
  @IsNumber()
  @IsOptional()
  bloodLoss?: number;

  @ApiPropertyOptional({ description: 'Duration in minutes' })
  @IsNumber()
  @IsOptional()
  duration?: number;

  @ApiPropertyOptional({ description: 'Start time' })
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time' })
  @IsDateString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Actual cost' })
  @IsNumber()
  @IsOptional()
  actualCost?: number;

  @ApiPropertyOptional({ description: 'Implants used' })
  @IsOptional()
  implants?: string[];

  @ApiPropertyOptional({ description: 'Cancel reason' })
  @IsString()
  @IsOptional()
  cancelReason?: string;
}
