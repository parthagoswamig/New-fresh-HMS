import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsArray,
  Min,
} from 'class-validator';

export enum SurgeryStatusEnum {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum SurgeryTypeEnum {
  GENERAL = 'GENERAL',
  ORTHOPEDIC = 'ORTHOPEDIC',
  CARDIAC = 'CARDIAC',
  NEUROSURGERY = 'NEUROSURGERY',
  PLASTIC = 'PLASTIC',
  GYNECOLOGICAL = 'GYNECOLOGICAL',
  UROLOGICAL = 'UROLOGICAL',
  OPHTHALMIC = 'OPHTHALMIC',
  ENT = 'ENT',
  PEDIATRIC = 'PEDIATRIC',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER',
}

export class CreateSurgeryDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsString()
  patientId: string;

  @ApiProperty({ description: 'Surgeon ID' })
  @IsString()
  surgeonId: string;

  @ApiPropertyOptional({ description: 'Assistant surgeon IDs', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  assistantIds?: string[];

  @ApiPropertyOptional({ description: 'Anesthesiologist ID' })
  @IsString()
  @IsOptional()
  anesthesiologistId?: string;

  @ApiProperty({ description: 'Operating room ID' })
  @IsString()
  otRoomId: string;

  @ApiProperty({ enum: SurgeryTypeEnum })
  @IsEnum(SurgeryTypeEnum)
  surgeryType: SurgeryTypeEnum;

  @ApiProperty({ description: 'Procedure name' })
  @IsString()
  procedureName: string;

  @ApiProperty({ description: 'Scheduled date and time' })
  @IsDateString()
  scheduledDate: string;

  @ApiPropertyOptional({ description: 'Pre-operative diagnosis' })
  @IsString()
  @IsOptional()
  preOpDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Pre-operative notes' })
  @IsString()
  @IsOptional()
  preOpNote?: string;

  @ApiPropertyOptional({ description: 'Required equipment', type: [String] })
  @IsOptional()
  requiredEquipment?: string[];

  @ApiProperty({ description: 'Estimated cost' })
  @IsNumber()
  @Min(0)
  estimatedCost: number;

  @ApiPropertyOptional({ description: 'Consent form URL' })
  @IsString()
  @IsOptional()
  consentFormUrl?: string;
}
