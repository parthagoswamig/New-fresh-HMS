import { IsString, IsArray, IsOptional, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TestResultDto {
  @ApiProperty({ 
    description: 'Lab entry item ID',
    example: 'item-uuid-123'
  })
  @IsString()
  itemId: string;

  @ApiProperty({ 
    description: 'Test result value',
    example: '8500'
  })
  @IsString()
  result: string;

  @ApiPropertyOptional({ 
    description: 'Unit of measurement (optional override)',
    example: 'cells/μL'
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ 
    description: 'Reference range (optional override)',
    example: '4000-11000'
  })
  @IsString()
  @IsOptional()
  referenceRange?: string;
}

export class AddLabResultsDto {
  @ApiProperty({ 
    description: 'Array of test results',
    type: [TestResultDto]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one result must be provided' })
  @ValidateNested({ each: true })
  @Type(() => TestResultDto)
  results: TestResultDto[];

  @ApiPropertyOptional({ 
    description: 'Overall clinical findings',
    example: 'All values within normal range'
  })
  @IsString()
  @IsOptional()
  findings?: string;

  @ApiPropertyOptional({ 
    description: 'Medical interpretation',
    example: 'No abnormalities detected'
  })
  @IsString()
  @IsOptional()
  interpretation?: string;

  @ApiPropertyOptional({ 
    description: 'Doctor/Technician comments',
    example: 'Patient is healthy. Recommend follow-up in 6 months.'
  })
  @IsString()
  @IsOptional()
  comments?: string;
}
