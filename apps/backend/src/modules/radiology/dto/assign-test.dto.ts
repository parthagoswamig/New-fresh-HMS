import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTestDto {
  @ApiProperty({ description: 'Patient ID', example: 'patient-uuid-123' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Radiology Test ID', example: 'test-uuid-456' })
  @IsString()
  testId: string;
}
