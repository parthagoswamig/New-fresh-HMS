import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRadiologyTestDto {
  @ApiProperty({ description: 'Test name', example: 'X-Ray Chest PA' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique test code', example: 'XRAY-CHEST-PA' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Test description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Test price', example: 500 })
  @IsNumber()
  @Min(0)
  price: number;
}
