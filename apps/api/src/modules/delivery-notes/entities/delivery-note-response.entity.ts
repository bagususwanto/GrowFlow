import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryNoteStatus, DeliveryNoteLineItem } from '@growflow/types';
import { DeliveryNoteStatus as PrismaDeliveryNoteStatus } from '@prisma/client';

export class DeliveryNoteLineItemEntity implements DeliveryNoteLineItem {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  deliveryNoteId!: string;

  @ApiProperty()
  soLineItemId!: string;

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
      qtyDelivered: { type: 'number' },
      unitPrice: { type: 'number' },
    },
  })
  soLineItem?: {
    id: string;
    qty: number;
    qtyDelivered: number;
    unitPrice: number;
  };
}

export class DeliveryNoteResponseEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: string;

  @ApiProperty()
  salesOrderId!: string;

  @ApiProperty({ enum: PrismaDeliveryNoteStatus })
  status!: DeliveryNoteStatus;

  @ApiProperty()
  deliveryDate!: string;

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
  salesOrder?: {
    id: string;
    number: string;
    customerId: string;
    warehouseId: string;
    customer?: {
      id: string;
      name: string;
    };
    warehouse?: {
      id: string;
      name: string;
    };
  };

  @ApiPropertyOptional()
  createdBy?: {
    id: string;
    name: string;
  };

  @ApiPropertyOptional({ type: [DeliveryNoteLineItemEntity] })
  lineItems?: DeliveryNoteLineItemEntity[];
}
