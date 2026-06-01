import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { RecordPaymentRequest } from '@growflow/types';
import { Type } from 'class-transformer';

export class RecordPaymentDto implements RecordPaymentRequest {
  @ApiProperty()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  note?: string;
}
