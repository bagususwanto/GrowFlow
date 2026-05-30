import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  GoodsReceipt,
  CreateGoodsReceiptRequest,
  PaginatedResponse,
  ListGoodsReceiptsQuery,
} from '@growflow/types';
import { poKeys } from './use-purchase-orders';

export const grKeys = {
  all: ['goods-receipts'] as const,
  lists: () => [...grKeys.all, 'list'] as const,
  list: (query: ListGoodsReceiptsQuery) => [...grKeys.lists(), query] as const,
  details: () => [...grKeys.all, 'detail'] as const,
  detail: (id: string) => [...grKeys.details(), id] as const,
};

export function useGoodsReceipts(query: ListGoodsReceiptsQuery = {}) {
  return useQuery<PaginatedResponse<GoodsReceipt>>({
    queryKey: grKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<GoodsReceipt>>(`/goods-receipts?${params.toString()}`);
    },
  });
}

export function useGoodsReceipt(id: string) {
  return useQuery<GoodsReceipt>({
    queryKey: grKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<GoodsReceipt>(`/goods-receipts/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation<GoodsReceipt, Error, CreateGoodsReceiptRequest>({
    mutationFn: async (data) => {
      return apiClient.post<GoodsReceipt>('/goods-receipts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: grKeys.lists() });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
    },
  });
}

export function useConfirmGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation<GoodsReceipt, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<GoodsReceipt>(`/goods-receipts/${id}/confirm`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: grKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: grKeys.lists() });
      queryClient.invalidateQueries({ queryKey: poKeys.lists() });
      if (data.purchaseOrderId) {
        queryClient.invalidateQueries({ queryKey: poKeys.detail(data.purchaseOrderId) });
      }
    },
  });
}

export function useDeleteGoodsReceipt() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/goods-receipts/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: grKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: grKeys.lists() });
    },
  });
}
