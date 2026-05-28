import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
  PaginatedResponse,
  ListWarehousesQuery,
} from '@growflow/types';

// Query keys
export const warehouseKeys = {
  all: ['warehouses'] as const,
  lists: () => [...warehouseKeys.all, 'list'] as const,
  list: (query: ListWarehousesQuery) => [...warehouseKeys.lists(), query] as const,
  details: () => [...warehouseKeys.all, 'detail'] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
};

/**
 * Hook to retrieve a paginated, filtered, and sorted list of warehouses.
 */
export function useWarehouses(query: ListWarehousesQuery = {}) {
  return useQuery<PaginatedResponse<Warehouse>>({
    queryKey: warehouseKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<Warehouse>>(`/warehouses?${params.toString()}`);
    },
  });
}

/**
 * Hook to retrieve a single warehouse by ID.
 */
export function useWarehouse(id: string) {
  return useQuery<Warehouse>({
    queryKey: warehouseKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<Warehouse>(`/warehouses/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new warehouse.
 */
export function useCreateWarehouse() {
  const queryClient = useQueryClient();

  return useMutation<Warehouse, Error, CreateWarehouseRequest>({
    mutationFn: async (data) => {
      return apiClient.post<Warehouse>('/warehouses', data);
    },
    onSuccess: () => {
      // Invalidate warehouse lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing warehouse.
 */
export function useUpdateWarehouse(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Warehouse, Error, UpdateWarehouseRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<Warehouse>(`/warehouses/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate the specific warehouse detail and the list
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}

/**
 * Hook to delete (soft-delete) a warehouse.
 */
export function useDeleteWarehouse() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/warehouses/${id}`);
    },
    onSuccess: (_, id) => {
      // Invalidate the specific warehouse detail and the list
      queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.lists() });
    },
  });
}
