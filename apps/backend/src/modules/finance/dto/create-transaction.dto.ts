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

export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  ADVANCE = 'ADVANCE',
  REFUND = 'REFUND',
}

export enum TransactionSourceEnum {
  MANUAL = 'MANUAL',
  BILLING = 'BILLING',
  INSURANCE = 'INSURANCE',
  INVENTORY = 'INVENTORY',
  PAYROLL = 'PAYROLL',
  PHARMACY = 'PHARMACY',
  LABORATORY = 'LABORATORY',
  RADIOLOGY = 'RADIOLOGY',
  IPD = 'IPD',
  OPD = 'OPD',
  SURGERY = 'SURGERY',
  REFUND = 'REFUND',
}

export enum PaymentMethodEnum {
  CASH = 'CASH',
  CARD = 'CARD',
  ONLINE = 'ONLINE',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHEQUE = 'CHEQUE',
  INSURANCE = 'INSURANCE',
}

export enum FinanceCategoryEnum {
  CONSULTATION_FEE = 'CONSULTATION_FEE',
  MEDICINE_SALES = 'MEDICINE_SALES',
  LAB_TEST = 'LAB_TEST',
  RADIOLOGY = 'RADIOLOGY',
  SURGERY_FEE = 'SURGERY_FEE',
  ROOM_CHARGES = 'ROOM_CHARGES',
  INSURANCE_REIMBURSEMENT = 'INSURANCE_REIMBURSEMENT',
  SALARY = 'SALARY',
  RENT = 'RENT',
  UTILITIES = 'UTILITIES',
  EQUIPMENT = 'EQUIPMENT',
  SUPPLIES = 'SUPPLIES',
  MAINTENANCE = 'MAINTENANCE',
  MARKETING = 'MARKETING',
  REFUND = 'REFUND',
  DONATION = 'DONATION',
  OTHER = 'OTHER',
}

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionTypeEnum })
  @IsEnum(TransactionTypeEnum)
  type: TransactionTypeEnum;

  @ApiProperty({ description: 'Transaction amount' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: TransactionSourceEnum })
  @IsEnum(TransactionSourceEnum)
  sourceModule: TransactionSourceEnum;

  @ApiPropertyOptional({ description: 'Source reference ID (billId, invoiceId, etc.)' })
  @IsString()
  @IsOptional()
  sourceReference?: string;

  @ApiProperty({ description: 'Transaction reason' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Detailed description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: PaymentMethodEnum })
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({ enum: FinanceCategoryEnum })
  @IsEnum(FinanceCategoryEnum)
  category: FinanceCategoryEnum;

  @ApiPropertyOptional({ description: 'Tags for categorization', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({ description: 'Transaction date' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Attachment URLs', type: [String] })
  @IsOptional()
  attachments?: string[];

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Linked patient ID' })
  @IsString()
  @IsOptional()
  patientId?: string;

  @ApiPropertyOptional({ description: 'Linked staff ID' })
  @IsString()
  @IsOptional()
  staffId?: string;
}
