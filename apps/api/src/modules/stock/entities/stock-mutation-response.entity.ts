import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StockMutation, MutationType } from '@growflow/types';
import { ItemResponseEntity } from '../../items/entities/item-response.entity';
import { WarehouseResponseEntity } from '../../warehouses/entities/warehouse-response.entity';

export class StockMutationResponseEntity implements StockMutation {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty({ enum: ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'] })
  type!: MutationType;

  @ApiProperty({ required: false, nullable: true })
  referenceType!: string | null;

  @ApiProperty({ required: false, nullable: true })
  referenceId!: string | null;

  @ApiProperty({ required: false, nullable: true })
  note!: string | null;

  @ApiProperty()
  itemId!: string;

  @ApiPropertyOptional({ type: ItemResponseEntity })
  item?: ItemResponseEntity;

  @ApiProperty()
  warehouseId!: string;

  @ApiPropertyOptional({ type: WarehouseResponseEntity })
  warehouse?: WarehouseResponseEntity;

  @ApiProperty({ required: false, nullable: true })
  createdById!: string | null;

  @ApiProperty()
  createdAt!: string;
}

