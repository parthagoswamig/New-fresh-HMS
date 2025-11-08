import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class DischargeIpdDto {
  @ApiProperty({ description: 'Discharge summary', example: 'Patient has recovered and is fit for discharge.' })
  @IsString()
  @IsNotEmpty()
  dischargeSummary: string;

  @ApiPropertyOptional({ description: 'Additional discharge notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
