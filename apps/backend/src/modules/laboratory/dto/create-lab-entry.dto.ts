import { IsString, IsArray, IsOptional, IsBoolean, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LabEntryTestDto {
  @ApiProperty({ description: 'Lab test ID', example: 'test-uuid-123' })
  @IsString()
  labTestId: string;
}

export class CreateLabEntryDto {
  @ApiProperty({ description: 'Patient ID', example: 'patient-uuid-123' })
  @IsString()
  patientId: string;

  @ApiProperty({ 
    description: 'Array of selected lab test IDs', 
    type: [LabEntryTestDto],
    example: [{ labTestId: 'test-1' }, { labTestId: 'test-2' }]
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one test must be selected' })
  @ValidateNested({ each: true })
  @Type(() => LabEntryTestDto)
  tests: LabEntryTestDto[];

  @ApiPropertyOptional({ 
    description: 'Sample type', 
    example: 'Blood',
    enum: ['Blood', 'Urine', 'Stool', 'Saliva', 'Tissue', 'Other']
  })
  @IsString()
  @IsOptional()
  sampleType?: string;

  @ApiPropertyOptional({ description: 'Additional notes or instructions' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ 
    description: 'Create bill immediately', 
    default: false 
  })
  @IsBoolean()
  @IsOptional()
  billNow?: boolean;
}
