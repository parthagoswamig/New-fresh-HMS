import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLabTestMasterDto {
  @ApiProperty({ description: 'Test name', example: 'Complete Blood Count' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Test category', example: 'Hematology' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ description: 'Test price', example: 500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Test description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement', example: 'cells/μL' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Reference range', example: '4000-11000' })
  @IsString()
  @IsOptional()
  referenceRange?: string;
}
