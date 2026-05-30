import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ListPurchaseOrdersQuery, PurchaseOrderStatus } from '@growflow/types';
import { PurchaseOrderStatus as PrismaPurchaseOrderStatus } from '@prisma/client';

export class ListPurchaseOrdersQueryDto implements ListPurchaseOrdersQuery {
  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: PrismaPurchaseOrderStatus })
  @IsEnum(PrismaPurchaseOrderStatus)
  @IsOptional()
  status?: PurchaseOrderStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
