import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  Item,
  CreateItemRequest,
  UpdateItemRequest,
  PaginatedResponse,
  ListItemsQuery,
} from '@growflow/types';

export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (query: ListItemsQuery) => [...itemKeys.lists(), query] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

export function useItems(query: ListItemsQuery = {}) {
  return useQuery<PaginatedResponse<Item>>({
    queryKey: itemKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<Item>>(`/items?${params.toString()}`);
    },
  });
}

export function useItem(id: string) {
  return useQuery<Item>({
    queryKey: itemKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<Item>(`/items/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, CreateItemRequest>({
    mutationFn: async (data) => {
      return apiClient.post<Item>('/items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

export function useUpdateItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Item, Error, UpdateItemRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<Item>(`/items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/items/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
    },
  });
}
