export type GoodsReceiptStatus = 'DRAFT' | 'CONFIRMED';

export interface GoodsReceiptLineItem {
  id: string;
  goodsReceiptId: string;
  poLineItemId: string;
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
  poLineItem?: {
    id: string;
    qty: number;
    qtyReceived: number;
    unitPrice: number;
  };
}

export interface GoodsReceipt {
  id: string;
  number: string;
  purchaseOrderId: string;
  warehouseId: string;
  status: GoodsReceiptStatus;
  receivedDate: string;
  note: string | null;
  createdById: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  purchaseOrder?: {
    id: string;
    number: string;
    supplierId: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  lineItems?: GoodsReceiptLineItem[];
}

export interface CreateGoodsReceiptLineItemRequest {
  poLineItemId: string;
  itemId: string;
  qty: number;
}

export interface CreateGoodsReceiptRequest {
  purchaseOrderId: string;
  warehouseId: string;
  note?: string;
  receivedDate?: string;
  lineItems: CreateGoodsReceiptLineItemRequest[];
}

export interface ListGoodsReceiptsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: GoodsReceiptStatus;
  purchaseOrderId?: string;
  warehouseId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
