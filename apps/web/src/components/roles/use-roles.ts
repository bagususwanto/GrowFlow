import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  PaginatedResponse,
  ListRolesQuery,
} from '@growflow/types';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (query: ListRolesQuery) => [...roleKeys.lists(), query] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
};

/**
 * Hook to retrieve a paginated, filtered, and sorted list of roles.
 */
export function useRoles(query: ListRolesQuery = {}) {
  return useQuery<PaginatedResponse<RoleResponse>>({
    queryKey: roleKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<RoleResponse>>(`/roles?${params.toString()}`);
    },
  });
}

/**
 * Hook to retrieve a simple list of all roles (typically for dropdowns).
 */
export function useRolesList() {
  return useQuery<PaginatedResponse<RoleResponse>>({
    queryKey: [...roleKeys.lists(), 'all-dropdown'],
    queryFn: async () => {
      return apiClient.get<PaginatedResponse<RoleResponse>>('/roles?limit=100');
    },
  });
}

/**
 * Hook to retrieve a single role by ID.
 */
export function useRole(id: string) {
  return useQuery<RoleResponse>({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<RoleResponse>(`/roles/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new role.
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation<RoleResponse, Error, CreateRoleRequest>({
    mutationFn: async (data) => {
      return apiClient.post<RoleResponse>('/roles', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing role.
 */
export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation<RoleResponse, Error, UpdateRoleRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<RoleResponse>(`/roles/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

/**
 * Hook to delete a role.
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/roles/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}
