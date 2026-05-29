import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCategoryItemDto } from './create-category-item.dto';
import { UpdateCategoryItemRequest } from '@growflow/types';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateCategoryItemDto extends PartialType(CreateCategoryItemDto) implements UpdateCategoryItemRequest {
  @ApiPropertyOptional({ description: 'Status aktif kategori' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
