import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockBalance } from '@growflow/types';
import { ItemResponseEntity } from '../../items/entities/item-response.entity';
import { WarehouseResponseEntity } from '../../warehouses/entities/warehouse-response.entity';

export class StockBalanceResponseEntity implements StockBalance {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  itemId!: string;

  @ApiPropertyOptional({ type: ItemResponseEntity })
  item?: ItemResponseEntity;

  @ApiProperty()
  warehouseId!: string;

  @ApiPropertyOptional({ type: WarehouseResponseEntity })
  warehouse?: WarehouseResponseEntity;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

