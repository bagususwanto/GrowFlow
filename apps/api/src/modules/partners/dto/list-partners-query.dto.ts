import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ListPartnersQuery, PartnerType } from '@growflow/types';
import { PartnerType as PrismaPartnerType } from '@prisma/client';

export class ListPartnersQueryDto implements ListPartnersQuery {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: PrismaPartnerType })
  @IsOptional()
  @IsEnum(PrismaPartnerType)
  type?: PartnerType;
}
