import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsNumber,
  IsDateString,
  IsArray,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export enum EmergencySeverity {
  CRITICAL = 'CRITICAL',
  SERIOUS = 'SERIOUS',
  MODERATE = 'MODERATE',
  STABLE = 'STABLE',
}

export enum ArrivalMode {
  AMBULANCE = 'AMBULANCE',
  WALK_IN = 'WALK_IN',
  REFERRED = 'REFERRED',
  POLICE = 'POLICE',
  OTHER = 'OTHER',
}

export class CreateEmergencyDto {
  // Patient Information (either existing patient or quick registration)
  @ApiPropertyOptional({ description: 'Existing patient ID' })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Quick registration name' })
  @IsOptional()
  @IsString()
  quickName?: string;

  @ApiPropertyOptional({ description: 'Quick registration age' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  quickAge?: number;

  @ApiPropertyOptional({ description: 'Quick registration gender' })
  @IsOptional()
  @IsString()
  quickGender?: string;

  @ApiPropertyOptional({ description: 'Quick registration contact' })
  @IsOptional()
  @IsString()
  quickContact?: string;

  @ApiPropertyOptional({ description: 'Quick registration address' })
  @IsOptional()
  @IsString()
  quickAddress?: string;

  // Triage Information
  @ApiProperty({ enum: EmergencySeverity, description: 'Severity level' })
  @IsEnum(EmergencySeverity)
  severity: EmergencySeverity;

  @ApiProperty({ description: 'Chief complaint' })
  @IsString()
  chiefComplaint: string;

  @ApiProperty({ enum: ArrivalMode, description: 'Mode of arrival' })
  @IsEnum(ArrivalMode)
  arrivalMode: ArrivalMode;

  @ApiPropertyOptional({ description: 'Arrival time' })
  @IsOptional()
  @IsDateString()
  arrivalTime?: string;

  @ApiPropertyOptional({ description: 'First responder staff ID' })
  @IsOptional()
  @IsString()
  firstResponderId?: string;

  @ApiPropertyOptional({ description: 'Triage nurse staff ID' })
  @IsOptional()
  @IsString()
  triageNurseId?: string;

  @ApiPropertyOptional({ description: 'Attending doctor staff ID' })
  @IsOptional()
  @IsString()
  attendingDoctorId?: string;

  // Vitals
  @ApiPropertyOptional({ description: 'Blood pressure (e.g., 120/80)' })
  @IsOptional()
  @IsString()
  bloodPressure?: string;

  @ApiPropertyOptional({ description: 'Heart rate (bpm)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(300)
  heartRate?: number;

  @ApiPropertyOptional({ description: 'Temperature (°C)' })
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(45)
  temperature?: number;

  @ApiPropertyOptional({ description: 'Respiratory rate (breaths/min)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  respiratoryRate?: number;

  @ApiPropertyOptional({ description: 'Oxygen saturation (%)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  oxygenSaturation?: number;

  // Clinical Information
  @ApiPropertyOptional({ description: 'Primary diagnosis' })
  @IsOptional()
  @IsString()
  primaryDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Secondary diagnosis' })
  @IsOptional()
  @IsString()
  secondaryDiagnosis?: string;

  @ApiPropertyOptional({ description: 'Known allergies' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ description: 'Current medications' })
  @IsOptional()
  @IsString()
  currentMedications?: string;

  @ApiPropertyOptional({ description: 'Medical history' })
  @IsOptional()
  @IsString()
  medicalHistory?: string;

  // Treatment Information
  @ApiPropertyOptional({ description: 'Progress notes (SOAP format)' })
  @IsOptional()
  @IsArray()
  progressNotes?: any[];

  @ApiPropertyOptional({ description: 'Emergency interventions' })
  @IsOptional()
  @IsArray()
  interventions?: any[];

  @ApiPropertyOptional({ description: 'Investigation orders' })
  @IsOptional()
  @IsArray()
  investigations?: any[];

  @ApiPropertyOptional({ description: 'Emergency medications' })
  @IsOptional()
  @IsArray()
  medications?: any[];

  // Billing
  @ApiPropertyOptional({ description: 'Estimated cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedCost?: number;

  // Audit
  @ApiProperty({ description: 'Created by staff ID' })
  @IsString()
  createdById: string;
}
