import { ApiProperty } from '@nestjs/swagger';
import { StockBalance } from '@growflow/types';

export class StockBalanceResponseEntity implements StockBalance {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
