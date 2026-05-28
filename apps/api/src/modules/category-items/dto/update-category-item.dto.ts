import { PartialType } from '@nestjs/swagger';
import { CreateCategoryItemDto } from './create-category-item.dto';
import { UpdateCategoryItemRequest } from '@growflow/types';

export class UpdateCategoryItemDto extends PartialType(CreateCategoryItemDto) implements UpdateCategoryItemRequest {}
