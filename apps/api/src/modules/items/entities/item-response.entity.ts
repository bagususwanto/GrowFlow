import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Item } from '@growflow/types';

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
  category!: string | null;

  @ApiProperty()
  minStock!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
