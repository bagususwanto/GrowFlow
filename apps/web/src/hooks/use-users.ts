import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  PaginatedResponse,
} from '@growflow/types';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (page: number, limit: number) => [...userKeys.lists(), { page, limit }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to retrieve a paginated list of users.
 */
export function useUsers(page = 1, limit = 10) {
  return useQuery<PaginatedResponse<UserResponse>>({
    queryKey: userKeys.list(page, limit),
    queryFn: async () => {
      return apiClient.get<PaginatedResponse<UserResponse>>(
        `/users?page=${page}&limit=${limit}`
      );
    },
  });
}

/**
 * Hook to retrieve a single user by ID.
 */
export function useUser(id: string) {
  return useQuery<UserResponse>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<UserResponse>(`/users/${id}`);
    },
    enabled: !!id,
  });
}

/**
 * Hook to create a new user.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, CreateUserRequest>({
    mutationFn: async (data) => {
      return apiClient.post<UserResponse>('/users', data);
    },
    onSuccess: () => {
      // Invalidate user lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing user.
 */
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, UpdateUserRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<UserResponse>(`/users/${id}`, data);
    },
    onSuccess: () => {
      // Invalidate the specific user detail and the list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete (soft-delete) a user.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/users/${id}`);
    },
    onSuccess: (_, id) => {
      // Invalidate the specific user detail and the list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
