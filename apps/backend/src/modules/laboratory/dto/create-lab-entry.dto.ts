import { IsString, IsArray, IsOptional, IsBoolean, IsNumber, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LabEntryTestDto {
  @ApiProperty({ description: 'Lab test ID' })
  @IsString()
  labTestId: string;

  @ApiProperty({ description: 'Test name' })
  @IsString()
  testName: string;

  @ApiProperty({ description: 'Test price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Reference range' })
  @IsString()
  @IsOptional()
  referenceRange?: string;
}

export class CreateLabEntryDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Selected lab tests', type: [LabEntryTestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabEntryTestDto)
  tests: LabEntryTestDto[];

  @ApiPropertyOptional({ description: 'Sample type (e.g., Blood, Urine)' })
  @IsString()
  @IsOptional()
  sampleType?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Bill immediately', default: false })
  @IsBoolean()
  @IsOptional()
  billNow?: boolean;
}
