import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum RadiologyStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export class UpdateResultDto {
  @ApiProperty({ description: 'Result summary/findings' })
  @IsString()
  resultSummary: string;

  @ApiProperty({ description: 'Radiologist name' })
  @IsString()
  radiologist: string;

  @ApiPropertyOptional({ description: 'Report file URL' })
  @IsString()
  @IsOptional()
  reportUrl?: string;

  @ApiProperty({ 
    description: 'Test status', 
    enum: RadiologyStatus,
    example: RadiologyStatus.COMPLETED 
  })
  @IsEnum(RadiologyStatus)
  status: RadiologyStatus;
}
