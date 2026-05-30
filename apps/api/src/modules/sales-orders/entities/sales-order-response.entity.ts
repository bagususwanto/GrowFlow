import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SalesOrderStatus, SalesOrderLineItem } from '@growflow/types';
import { SalesOrderStatus as PrismaSalesOrderStatus } from '@prisma/client';

export class SalesOrderLineItemEntity implements SalesOrderLineItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  salesOrderId!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty()
  qtyDelivered!: number;

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
}

export class SalesOrderResponseEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  warehouseId!: string;

  @ApiProperty({ enum: PrismaSalesOrderStatus })
  status!: SalesOrderStatus;

  @ApiProperty({ type: String, nullable: true })
  note!: string | null;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  orderDate!: string;

  @ApiProperty({ type: String, nullable: true })
  createdById!: string | null;

  @ApiProperty({ type: String, nullable: true })
  confirmedById!: string | null;

  @ApiProperty({ type: String, nullable: true })
  confirmedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  cancelledAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional()
  customer?: {
    id: string;
    code: string;
    name: string;
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

  @ApiPropertyOptional()
  confirmedBy?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ type: [SalesOrderLineItemEntity] })
  lineItems?: SalesOrderLineItemEntity[];
}
