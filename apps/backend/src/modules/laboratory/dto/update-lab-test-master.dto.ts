import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLabTestMasterDto {
  @ApiPropertyOptional({ description: 'Test name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Test category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Test price' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Test description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Reference range' })
  @IsString()
  @IsOptional()
  referenceRange?: string;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
