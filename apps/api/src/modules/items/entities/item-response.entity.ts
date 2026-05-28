import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Item } from '@growflow/types';
import { CategoryItemResponseEntity } from '../../category-items/entities/category-item-response.entity';

export class ItemResponseEntity implements Item {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  unit!: string;

  @ApiPropertyOptional({ nullable: true })
  categoryId!: string | null;

  @ApiPropertyOptional({ type: CategoryItemResponseEntity, nullable: true })
  category?: CategoryItemResponseEntity | null;

  @ApiProperty()
  minStock!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
