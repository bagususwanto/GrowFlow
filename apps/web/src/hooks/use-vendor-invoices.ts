import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import { PaginatedResponse } from '@growflow/types';

// Let's define custom interface representing the responses
export interface VendorInvoicePayment {
  id: string;
  vendorInvoiceId: string;
  amount: number;
  paymentDate: string;
  note: string | null;
  recordedById: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VendorInvoice {
  id: string;
  number: string;
  goodsReceiptId: string;
  purchaseOrderId: string;
  supplierId: string;
  status: 'DRAFT' | 'RECEIVED' | 'PARTIAL' | 'PAID' | 'CANCELLED';
  invoiceDate: string;
  dueDate: string;
  paymentTermsDays: number;
  totalAmount: number;
  paidAmount: number;
  note: string | null;
  receivedAt: string | null;
  receivedById: string | null;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    code: string;
    name: string;
  };
  goodsReceipt?: {
    id: string;
    number: string;
  };
  purchaseOrder?: {
    id: string;
    number: string;
  };
  payments?: VendorInvoicePayment[];
}

export interface ListVendorInvoicesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ReceiveVendorInvoiceRequest {
  invoiceDate?: string;
  dueDate?: string;
  note?: string;
}

export interface RecordVendorPaymentRequest {
  amount: number;
  paymentDate?: string;
  note?: string;
}

export const vendorInvoiceKeys = {
  all: ['vendor-invoices'] as const,
  lists: () => [...vendorInvoiceKeys.all, 'list'] as const,
  list: (query: ListVendorInvoicesQuery) => [...vendorInvoiceKeys.lists(), query] as const,
  details: () => [...vendorInvoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorInvoiceKeys.details(), id] as const,
};

export function useVendorInvoices(query: ListVendorInvoicesQuery = {}) {
  return useQuery<PaginatedResponse<VendorInvoice>>({
    queryKey: vendorInvoiceKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<VendorInvoice>>(`/vendor-invoices?${params.toString()}`);
    },
  });
}

export function useVendorInvoice(id: string) {
  return useQuery<VendorInvoice>({
    queryKey: vendorInvoiceKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<VendorInvoice>(`/vendor-invoices/${id}`);
    },
    enabled: !!id,
  });
}

export function useReceiveVendorInvoice() {
  const queryClient = useQueryClient();

  return useMutation<VendorInvoice, Error, { id: string; data: ReceiveVendorInvoiceRequest }>({
    mutationFn: async ({ id, data }) => {
      return apiClient.patch<VendorInvoice>(`/vendor-invoices/${id}/receive`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.lists() });
      // Invalidate accounting keys for reports & accounts
      queryClient.invalidateQueries({ queryKey: ['accounting'] });
    },
  });
}

export function useRecordVendorInvoicePayment(id: string) {
  const queryClient = useQueryClient();

  return useMutation<VendorInvoice, Error, RecordVendorPaymentRequest>({
    mutationFn: async (data) => {
      return apiClient.post<VendorInvoice>(`/vendor-invoices/${id}/payments`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['accounting'] });
    },
  });
}

export function useCancelVendorInvoice() {
  const queryClient = useQueryClient();

  return useMutation<VendorInvoice, Error, string>({
    mutationFn: async (id) => {
      return apiClient.patch<VendorInvoice>(`/vendor-invoices/${id}/cancel`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: vendorInvoiceKeys.lists() });
    },
  });
}
