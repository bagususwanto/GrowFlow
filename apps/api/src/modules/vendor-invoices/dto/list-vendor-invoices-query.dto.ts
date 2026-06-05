import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { VendorInvoiceStatus } from '@prisma/client';

export class ListVendorInvoicesQueryDto {
  @ApiPropertyOptional({ description: 'Search term for invoice number or note' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: ['DRAFT', 'RECEIVED', 'PARTIAL', 'PAID', 'CANCELLED'] })
  @IsEnum(['DRAFT', 'RECEIVED', 'PARTIAL', 'PAID', 'CANCELLED'])
  @IsOptional()
  status?: VendorInvoiceStatus;

  @ApiPropertyOptional({ description: 'Filter by supplier ID' })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional({ description: 'Start date' })
  @IsString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date' })
  @IsString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Limit' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  limit?: number;
}
