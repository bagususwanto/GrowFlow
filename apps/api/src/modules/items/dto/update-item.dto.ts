import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { UpdateItemRequest } from '@growflow/types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateItemDto extends PartialType(CreateItemDto) implements UpdateItemRequest {
  @ApiPropertyOptional({ description: 'Status aktif item' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
