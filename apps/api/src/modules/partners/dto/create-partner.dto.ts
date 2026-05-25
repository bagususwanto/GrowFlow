import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreatePartnerRequest, PartnerType } from '@growflow/types';
import { PartnerType as PrismaPartnerType } from '@prisma/client';

export class CreatePartnerDto implements CreatePartnerRequest {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code!: string;

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
}
