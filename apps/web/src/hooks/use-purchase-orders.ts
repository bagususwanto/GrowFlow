import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderRequest,
  PaginatedResponse,
  ListPurchaseOrdersQuery,
} from '@growflow/types';

export const poKeys = {
  all: ['purchase-orders'] as const,
  lists: () => [...poKeys.all, 'list'] as const,
  list: (query: ListPurchaseOrdersQuery) => [...poKeys.lists(), query] as const,
  details: () => [...poKeys.all, 'detail'] as const,
  detail: (id: string) => [...poKeys.details(), id] as const,
};

export function usePurchaseOrders(query: ListPurchaseOrdersQuery = {}) {
  return useQuery<PaginatedResponse<PurchaseOrder>>({
    queryKey: poKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<PurchaseOrder>>(`/purchase-orders?${params.toString()}`);
    },
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery<PurchaseOrder>({
    queryKey: poKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, CreatePurchaseOrderRequest>({
    mutationFn: async (data) => {
      return apiClient.post<PurchaseOrder>('/purchase-orders', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useUpdatePurchaseOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, UpdatePurchaseOrderRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/submit`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/approve`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation<PurchaseOrder, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/purchase-orders/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: poKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}
