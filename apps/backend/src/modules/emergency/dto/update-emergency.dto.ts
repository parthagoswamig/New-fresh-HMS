import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator';
import { CreateEmergencyDto } from './create-emergency.dto';

export enum EmergencyStatus {
  WAITING = 'WAITING',
  UNDER_TREATMENT = 'UNDER_TREATMENT',
  ADMITTED = 'ADMITTED',
  TRANSFERRED = 'TRANSFERRED',
  DISCHARGED = 'DISCHARGED',
  DECEASED = 'DECEASED',
}

export class UpdateEmergencyDto extends PartialType(CreateEmergencyDto) {
  @ApiPropertyOptional({ enum: EmergencyStatus, description: 'Emergency status' })
  @IsOptional()
  @IsEnum(EmergencyStatus)
  status?: EmergencyStatus;

  @ApiPropertyOptional({ description: 'Treatment start time' })
  @IsOptional()
  @IsDateString()
  treatmentStartTime?: string;

  @ApiPropertyOptional({ description: 'Treatment end time' })
  @IsOptional()
  @IsDateString()
  treatmentEndTime?: string;

  // Disposition
  @ApiPropertyOptional({ description: 'IPD admission ID if admitted' })
  @IsOptional()
  @IsString()
  admittedToIpdId?: string;

  @ApiPropertyOptional({ description: 'Transferred to (hospital/department)' })
  @IsOptional()
  @IsString()
  transferredTo?: string;

  @ApiPropertyOptional({ description: 'Transfer reason' })
  @IsOptional()
  @IsString()
  transferReason?: string;

  @ApiPropertyOptional({ description: 'Discharge time' })
  @IsOptional()
  @IsDateString()
  dischargeTime?: string;

  @ApiPropertyOptional({ description: 'Discharge summary' })
  @IsOptional()
  @IsString()
  dischargeSummary?: string;

  @ApiPropertyOptional({ description: 'Discharge advice' })
  @IsOptional()
  @IsString()
  dischargeAdvice?: string;

  @ApiPropertyOptional({ description: 'Follow-up date' })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  // Death Information
  @ApiPropertyOptional({ description: 'Death time' })
  @IsOptional()
  @IsDateString()
  deathTime?: string;

  @ApiPropertyOptional({ description: 'Cause of death' })
  @IsOptional()
  @IsString()
  causeOfDeath?: string;

  @ApiPropertyOptional({ description: 'Death certificate URL' })
  @IsOptional()
  @IsString()
  deathCertificateUrl?: string;

  // Billing
  @ApiPropertyOptional({ description: 'Bill ID' })
  @IsOptional()
  @IsString()
  billId?: string;

  @ApiPropertyOptional({ description: 'Actual cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  actualCost?: number;

  // Audit
  @ApiPropertyOptional({ description: 'Updated by staff ID' })
  @IsOptional()
  @IsString()
  updatedById?: string;
}
