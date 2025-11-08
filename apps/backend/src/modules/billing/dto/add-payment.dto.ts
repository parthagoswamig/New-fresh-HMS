import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddPaymentDto {
  @ApiProperty({ description: 'Payment amount', example: 1000 })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Payment method', example: 'CASH', enum: ['CASH', 'CARD', 'UPI', 'INSURANCE', 'BANK_TRANSFER'] })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Transaction ID or reference number' })
  @IsString()
  @IsOptional()
  transactionId?: string;

  @ApiPropertyOptional({ description: 'Payment notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}
