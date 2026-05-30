import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PurchaseOrderStatus, PurchaseOrderLineItem } from '@growflow/types';
import { PurchaseOrderStatus as PrismaPurchaseOrderStatus } from '@prisma/client';

export class PurchaseOrderLineItemEntity implements PurchaseOrderLineItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  purchaseOrderId!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty()
  qty!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty()
  qtyReceived!: number;

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

export class PurchaseOrderResponseEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  supplierId!: string;

  @ApiProperty({ enum: PrismaPurchaseOrderStatus })
  status!: PurchaseOrderStatus;

  @ApiProperty({ type: String, nullable: true })
  note!: string | null;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  orderDate!: string;

  @ApiProperty({ type: String, nullable: true })
  createdById!: string | null;

  @ApiProperty({ type: String, nullable: true })
  approvedById!: string | null;

  @ApiProperty({ type: String, nullable: true })
  approvedAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  cancelledAt!: string | null;

  @ApiProperty({ type: String, nullable: true })
  deletedAt!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional()
  supplier?: {
    id: string;
    code: string;
    name: string;
  };

  @ApiPropertyOptional()
  createdBy?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional()
  approvedBy?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ type: [PurchaseOrderLineItemEntity] })
  lineItems?: PurchaseOrderLineItemEntity[];
}
