export type DeliveryNoteStatus = 'DRAFT' | 'CONFIRMED';

export interface DeliveryNoteLineItem {
  id: string;
  deliveryNoteId: string;
  soLineItemId: string;
  itemId: string;
  qty: number;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
  soLineItem?: {
    id: string;
    qty: number;
    qtyDelivered: number;
    unitPrice: number;
  };
}

export interface DeliveryNote {
  id: string;
  number: string;
  salesOrderId: string;
  status: DeliveryNoteStatus;
  deliveryDate: string;
  note: string | null;
  createdById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  createdBy?: {
    id: string;
    name: string;
  };
  lineItems?: DeliveryNoteLineItem[];
}

export interface CreateDeliveryNoteLineItemRequest {
  soLineItemId: string;
  itemId: string;
  qty: number;
}

export interface CreateDeliveryNoteRequest {
  salesOrderId: string;
  note?: string;
  deliveryDate?: string;
  lineItems: CreateDeliveryNoteLineItemRequest[];
}

export interface ListDeliveryNotesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: DeliveryNoteStatus;
  salesOrderId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
