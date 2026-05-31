import { DeliveryNote } from './delivery-note';

export type SalesOrderStatus = 'DRAFT' | 'CONFIRMED' | 'PARTIAL' | 'DONE' | 'CANCELLED';


export interface SalesOrderLineItem {
  id: string;
  salesOrderId: string;
  itemId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  qtyDelivered: number;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export interface SalesOrder {
  id: string;
  number: string;
  customerId: string;
  warehouseId: string;
  status: SalesOrderStatus;
  note: string | null;
  totalAmount: number;
  orderDate: string;
  createdById: string | null;
  confirmedById: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  warehouse?: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string;
  };
  confirmedBy?: {
    id: string;
    name: string;
  };
  lineItems?: SalesOrderLineItem[];
  deliveryNotes?: DeliveryNote[];
}

export interface CreateSalesOrderLineItemRequest {
  itemId: string;
  qty: number;
  unitPrice: number;
}

export interface CreateSalesOrderRequest {
  customerId: string;
  warehouseId: string;
  note?: string;
  orderDate?: string;
  lineItems: CreateSalesOrderLineItemRequest[];
}

export interface UpdateSalesOrderRequest {
  customerId?: string;
  warehouseId?: string;
  note?: string;
  orderDate?: string;
  lineItems?: CreateSalesOrderLineItemRequest[];
}

export interface ListSalesOrdersQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SalesOrderStatus;
  customerId?: string;
  warehouseId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
