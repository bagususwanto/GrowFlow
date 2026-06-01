import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { CreatePartnerRequest, PartnerType } from '@growflow/types';
import { PartnerType as PrismaPartnerType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreatePartnerDto implements CreatePartnerRequest {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: PrismaPartnerType })
  @IsEnum(PrismaPartnerType)
  @IsNotEmpty()
  type!: PartnerType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  paymentTermsDays?: number;
}
