import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TestResultDto {
  @ApiProperty({ description: 'Lab entry item ID' })
  @IsString()
  itemId: string;

  @ApiProperty({ description: 'Test result value' })
  @IsString()
  result: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Reference range' })
  @IsString()
  @IsOptional()
  referenceRange?: string;
}

export class AddLabResultsDto {
  @ApiProperty({ description: 'Test results', type: [TestResultDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  results: TestResultDto[];

  @ApiPropertyOptional({ description: 'Overall findings' })
  @IsString()
  @IsOptional()
  findings?: string;

  @ApiPropertyOptional({ description: 'Medical interpretation' })
  @IsString()
  @IsOptional()
  interpretation?: string;

  @ApiPropertyOptional({ description: 'Doctor comments' })
  @IsString()
  @IsOptional()
  comments?: string;
}
