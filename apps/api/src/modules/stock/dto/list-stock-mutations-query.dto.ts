import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min, Max, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ListStockMutationsQuery, MutationType } from '@growflow/types';
import { MutationType as PrismaMutationType } from '@prisma/client';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class ListStockMutationsQueryDto implements ListStockMutationsQuery {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  itemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiPropertyOptional({ enum: PrismaMutationType })
  @IsOptional()
  @IsEnum(PrismaMutationType)
  type?: MutationType;

  @ApiPropertyOptional({ description: 'Filter mutations from this date' })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter mutations up to this date' })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ description: 'Search by item name or code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Sort field', enum: ['createdAt', 'qty', 'type'] })
  @IsOptional()
  @IsIn(['createdAt', 'qty', 'type'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', enum: SortOrder, default: SortOrder.DESC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

