import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoodsReceiptStatus, GoodsReceiptLineItem } from '@growflow/types';
import { GoodsReceiptStatus as PrismaGoodsReceiptStatus } from '@prisma/client';

export class GoodsReceiptLineItemEntity implements GoodsReceiptLineItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  goodsReceiptId!: string;

  @ApiProperty()
  poLineItemId!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      id: { type: 'string' },
      code: { type: 'string' },
      name: { type: 'string' },
      unit: { type: 'string' },
    },
  })
  item?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };

  @ApiPropertyOptional({
    type: 'object',
    properties: {
      id: { type: 'string' },
      qty: { type: 'number' },
      qtyReceived: { type: 'number' },
      unitPrice: { type: 'number' },
    },
  })
  poLineItem?: {
    id: string;
    qty: number;
    qtyReceived: number;
    unitPrice: number;
  };
}

export class GoodsReceiptResponseEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  purchaseOrderId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty({ enum: PrismaGoodsReceiptStatus })
  status!: GoodsReceiptStatus;

  @ApiProperty()
  receivedDate!: string;

  @ApiProperty({ type: String, nullable: true })
  note!: string | null;

  @ApiProperty({ type: String, nullable: true })
  createdById!: string | null;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional()
  purchaseOrder?: {
    id: string;
    number: string;
    supplierId: string;
  };

  @ApiPropertyOptional()
  warehouse?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  createdBy?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ type: [GoodsReceiptLineItemEntity] })
  lineItems?: GoodsReceiptLineItemEntity[];
}
