import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class CreateVendorPaymentDto {
  @ApiProperty({ description: 'The payment amount' })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional({ description: 'The date of the payment' })
  @IsString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  note?: string;
}
