import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  DeliveryNote,
  CreateDeliveryNoteRequest,
  PaginatedResponse,
  ListDeliveryNotesQuery,
} from '@growflow/types';
import { soKeys } from './use-sales-orders';

export const dnKeys = {
  all: ['delivery-notes'] as const,
  lists: () => [...dnKeys.all, 'list'] as const,
  list: (query: ListDeliveryNotesQuery) => [...dnKeys.lists(), query] as const,
  details: () => [...dnKeys.all, 'detail'] as const,
  detail: (id: string) => [...dnKeys.details(), id] as const,
};

export function useDeliveryNotes(query: ListDeliveryNotesQuery = {}) {
  return useQuery<PaginatedResponse<DeliveryNote>>({
    queryKey: dnKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<DeliveryNote>>(`/delivery-notes?${params.toString()}`);
    },
  });
}

export function useDeliveryNote(id: string) {
  return useQuery<DeliveryNote>({
    queryKey: dnKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<DeliveryNote>(`/delivery-notes/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation<DeliveryNote, Error, CreateDeliveryNoteRequest>({
    mutationFn: async (data) => {
      return apiClient.post<DeliveryNote>('/delivery-notes', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
      if (data.salesOrderId) {
        queryClient.invalidateQueries({ queryKey: soKeys.detail(data.salesOrderId) });
      }
    },
  });
}

export function useConfirmDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation<DeliveryNote, Error, string>({
    mutationFn: async (id) => {
      return apiClient.post<DeliveryNote>(`/delivery-notes/${id}/confirm`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: dnKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: dnKeys.lists() });
      queryClient.invalidateQueries({ queryKey: soKeys.lists() });
      if (data.salesOrderId) {
        queryClient.invalidateQueries({ queryKey: soKeys.detail(data.salesOrderId) });
      }
    },
  });
}

export function useDeleteDeliveryNote() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/delivery-notes/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dnKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dnKeys.lists() });
    },
  });
}
