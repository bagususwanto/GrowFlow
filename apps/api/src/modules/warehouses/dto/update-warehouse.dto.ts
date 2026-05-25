import { PartialType } from '@nestjs/swagger';
import { CreateWarehouseDto } from './create-warehouse.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { UpdateWarehouseRequest } from '@growflow/types';

export class UpdateWarehouseDto extends PartialType(CreateWarehouseDto) implements UpdateWarehouseRequest {
  @ApiPropertyOptional({ description: 'Is warehouse active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
