import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  SalesInvoice,
  RecordPaymentRequest,
  CreateCreditNoteRequest,
  PaginatedResponse,
  ListSalesInvoicesQuery,
} from '@growflow/types';

export const invoiceKeys = {
  all: ['sales-invoices'] as const,
  lists: () => [...invoiceKeys.all, 'list'] as const,
  list: (query: ListSalesInvoicesQuery) => [...invoiceKeys.lists(), query] as const,
  details: () => [...invoiceKeys.all, 'detail'] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useSalesInvoices(query: ListSalesInvoicesQuery = {}) {
  return useQuery<PaginatedResponse<SalesInvoice>>({
    queryKey: invoiceKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<SalesInvoice>>(`/sales-invoices?${params.toString()}`);
    },
  });
}

export function useSalesInvoice(id: string) {
  return useQuery<SalesInvoice>({
    queryKey: invoiceKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<SalesInvoice>(`/sales-invoices/${id}`);
    },
    enabled: !!id,
  });
}

export function useSendSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation<SalesInvoice, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/send`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}

export function useRecordInvoicePayment(id: string) {
  const queryClient = useQueryClient();

  return useMutation<SalesInvoice, Error, RecordPaymentRequest>({
    mutationFn: async (data) => {
      return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/payment`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      // Invalidate sales orders detail/list because status could transition to CLOSED
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

export function useCreateInvoiceCreditNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation<SalesInvoice, Error, CreateCreditNoteRequest>({
    mutationFn: async (data) => {
      return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/credit-note`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
    },
  });
}

export function useCancelSalesInvoice() {
  const queryClient = useQueryClient();

  return useMutation<SalesInvoice, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<SalesInvoice>(`/sales-invoices/${id}/cancel`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
  });
}
