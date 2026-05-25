import { PartialType } from '@nestjs/swagger';
import { CreatePartnerDto } from './create-partner.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { UpdatePartnerRequest } from '@growflow/types';

export class UpdatePartnerDto extends PartialType(CreatePartnerDto) implements UpdatePartnerRequest {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
