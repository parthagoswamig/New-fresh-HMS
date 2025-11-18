import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePrescriptionItemDto {
  @ApiProperty({ description: 'Medicine ID' })
  @IsString()
  medicineId: string;

  @ApiProperty({ description: 'Dosage instructions, e.g. 500mg' })
  @IsString()
  dosage: string;

  @ApiProperty({ description: 'Frequency, e.g. 1-0-1' })
  @IsString()
  frequency: string;

  @ApiProperty({ description: 'Duration, e.g. 5 days' })
  @IsString()
  duration: string;

  @ApiPropertyOptional({ description: 'Additional instructions for this medicine' })
  @IsString()
  @IsOptional()
  instructions?: string;

  @ApiProperty({ description: 'Quantity to dispense', example: 10 })
  @IsInt()
  @Min(1)
  quantity: number;
}
