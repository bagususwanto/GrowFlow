import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ListSalesInvoicesQuery, SalesInvoiceStatus } from '@growflow/types';
import { Type } from 'class-transformer';

export class ListSalesInvoicesQueryDto implements ListSalesInvoicesQuery {
  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Type(() => Number)
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  status?: SalesInvoiceStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  dateTo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
