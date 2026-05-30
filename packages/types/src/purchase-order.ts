export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'PARTIAL'
  | 'DONE'
  | 'CANCELLED';

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  itemId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  qtyReceived: number;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export interface PurchaseOrder {
  id: string;
  number: string;
  supplierId: string;
  status: PurchaseOrderStatus;
  note: string | null;
  totalAmount: number;
  orderDate: string;
  createdById: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  cancelledAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  approvedBy?: {
    id: string;
    name: string;
  };
  lineItems?: PurchaseOrderLineItem[];
}

export interface CreatePurchaseOrderLineItemRequest {
  itemId: string;
  qty: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: string;
  note?: string;
  orderDate?: string;
  lineItems: CreatePurchaseOrderLineItemRequest[];
}

export interface UpdatePurchaseOrderRequest {
  supplierId?: string;
  note?: string;
  orderDate?: string;
  lineItems?: CreatePurchaseOrderLineItemRequest[];
}

export interface ListPurchaseOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: PurchaseOrderStatus;
  supplierId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
