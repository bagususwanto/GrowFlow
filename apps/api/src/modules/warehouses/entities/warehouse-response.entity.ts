import { ApiProperty } from '@nestjs/swagger';
import { Warehouse } from '@growflow/types';

export class WarehouseResponseEntity implements Warehouse {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  address!: string | null;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
