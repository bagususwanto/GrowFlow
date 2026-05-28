import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  CategoryItem,
  CreateCategoryItemRequest,
  UpdateCategoryItemRequest,
  PaginatedResponse,
  ListCategoryItemsQuery,
} from '@growflow/types';

export const categoryKeys = {
  all: ['category-items'] as const,
  lists: () => [...categoryKeys.all, 'list'] as const,
  list: (query: ListCategoryItemsQuery) => [...categoryKeys.lists(), query] as const,
  details: () => [...categoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

export function useCategoryItems(query: ListCategoryItemsQuery = {}) {
  return useQuery<PaginatedResponse<CategoryItem>>({
    queryKey: categoryKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<CategoryItem>>(`/category-items?${params.toString()}`);
    },
  });
}

export function useCategoryItem(id: string) {
  return useQuery<CategoryItem>({
    queryKey: categoryKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<CategoryItem>(`/category-items/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateCategoryItem() {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, CreateCategoryItemRequest>({
    mutationFn: async (data) => {
      return apiClient.post<CategoryItem>('/category-items', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useUpdateCategoryItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation<CategoryItem, Error, UpdateCategoryItemRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<CategoryItem>(`/category-items/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

export function useDeleteCategoryItem() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/category-items/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
