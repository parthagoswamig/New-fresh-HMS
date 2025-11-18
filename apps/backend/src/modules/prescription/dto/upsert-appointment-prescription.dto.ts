import { IsArray, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePrescriptionItemDto } from './create-prescription-item.dto';

export class UpsertAppointmentPrescriptionDto {
  @ApiPropertyOptional({ description: 'Prescription date (defaults to now if not provided)' })
  @IsDateString()
  @IsOptional()
  prescriptionDate?: string;

  @ApiPropertyOptional({ description: 'Prescription status', example: 'PENDING' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ description: 'Overall notes for this prescription' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [CreatePrescriptionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrescriptionItemDto)
  items: CreatePrescriptionItemDto[];
}
