export type SalesInvoiceStatus = 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'CANCELLED';
export type SalesCreditNoteStatus = 'DRAFT' | 'APPLIED' | 'CANCELLED';

export interface SalesInvoiceLineItem {
  id: string;
  salesInvoiceId: string;
  soLineItemId: string;
  itemId: string;
  qty: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  item?: {
    id: string;
    code: string;
    name: string;
    unit: string;
  };
}

export interface SalesInvoicePayment {
  id: string;
  salesInvoiceId: string;
  amount: number;
  paymentDate: string;
  note: string | null;
  recordedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesCreditNote {
  id: string;
  number: string;
  salesInvoiceId: string;
  status: SalesCreditNoteStatus;
  amount: number;
  reason: string;
  note: string | null;
  issuedAt: string | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SalesInvoice {
  id: string;
  number: string;
  salesOrderId: string;
  customerId: string;
  status: SalesInvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  paymentTermsDays: number;
  totalAmount: number;
  paidAmount: number;
  note: string | null;
  sentAt: string | null;
  createdById: string | null;
  lineItems?: SalesInvoiceLineItem[];
  payments?: SalesInvoicePayment[];
  creditNotes?: SalesCreditNote[];
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    code: string;
    name: string;
  };
  salesOrder?: {
    id: string;
    number: string;
  };
}

export interface RecordPaymentRequest {
  amount: number;
  paymentDate?: string;
  note?: string;
}

export interface CreateCreditNoteRequest {
  amount: number;
  reason: string;
  note?: string;
}

export interface ListSalesInvoicesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: SalesInvoiceStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
