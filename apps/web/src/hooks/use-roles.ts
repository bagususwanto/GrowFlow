import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import { RoleResponse, PaginatedResponse } from '@growflow/types';

export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
};

export function useRoles() {
  return useQuery<PaginatedResponse<RoleResponse>>({
    queryKey: roleKeys.lists(),
    queryFn: async () => {
      return apiClient.get<PaginatedResponse<RoleResponse>>('/roles?limit=100');
    },
  });
}
