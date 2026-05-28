import { ApiProperty } from '@nestjs/swagger';
import { CategoryItem } from '@growflow/types';

export class CategoryItemResponseEntity implements CategoryItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
