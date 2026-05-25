import { ApiProperty } from '@nestjs/swagger';
import { StockMutation, MutationType } from '@growflow/types';

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

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty({ required: false, nullable: true })
  createdById!: string | null;

  @ApiProperty()
  createdAt!: string;
}
