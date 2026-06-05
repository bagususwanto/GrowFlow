import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReceiveVendorInvoiceDto {
  @ApiPropertyOptional({ description: 'The invoice date' })
  @IsString()
  @IsOptional()
  invoiceDate?: string;

  @ApiPropertyOptional({ description: 'The due date' })
  @IsString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  note?: string;
}
