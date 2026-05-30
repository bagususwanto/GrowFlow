import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  SalesOrder,
  CreateSalesOrderRequest,
  UpdateSalesOrderRequest,
  PaginatedResponse,
  ListSalesOrdersQuery,
} from '@growflow/types';

export const soKeys = {
  all: ['sales-orders'] as const,
  lists: () => [...soKeys.all, 'list'] as const,
  list: (query: ListSalesOrdersQuery) => [...soKeys.lists(), query] as const,
  details: () => [...soKeys.all, 'detail'] as const,
  detail: (id: string) => [...soKeys.details(), id] as const,
};

export function useSalesOrders(query: ListSalesOrdersQuery = {}) {
  return useQuery<PaginatedResponse<SalesOrder>>({
    queryKey: soKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<SalesOrder>>(`/sales-orders?${params.toString()}`);
    },
  });
}

export function useSalesOrder(id: string) {
  return useQuery<SalesOrder>({
    queryKey: soKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<SalesOrder>(`/sales-orders/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation<SalesOrder, Error, CreateSalesOrderRequest>({
    mutationFn: async (data) => {
      return apiClient.post<SalesOrder>('/sales-orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
    },
  });
}

export function useUpdateSalesOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation<SalesOrder, Error, UpdateSalesOrderRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<SalesOrder>(`/sales-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: soKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
    },
  });
}

export function useConfirmSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation<SalesOrder, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<SalesOrder>(`/sales-orders/${id}/confirm`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: soKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
    },
  });
}

export function useCancelSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation<SalesOrder, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<SalesOrder>(`/sales-orders/${id}/cancel`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: soKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
    },
  });
}

export function useDeleteSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/sales-orders/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: soKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
    },
  });
}
