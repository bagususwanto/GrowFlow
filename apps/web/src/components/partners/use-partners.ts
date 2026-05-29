import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  Partner,
  CreatePartnerRequest,
  UpdatePartnerRequest,
  PaginatedResponse,
  ListPartnersQuery,
} from '@growflow/types';

export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (query: ListPartnersQuery) => [...partnerKeys.lists(), query] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
};

export function usePartners(query: ListPartnersQuery = {}) {
  return useQuery<PaginatedResponse<Partner>>({
    queryKey: partnerKeys.list(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<Partner>>(`/partners?${params.toString()}`);
    },
  });
}

export function usePartner(id: string) {
  return useQuery<Partner>({
    queryKey: partnerKeys.detail(id),
    queryFn: async () => {
      return apiClient.get<Partner>(`/partners/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation<Partner, Error, CreatePartnerRequest>({
    mutationFn: async (data) => {
      return apiClient.post<Partner>('/partners', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}

export function useUpdatePartner(id: string) {
  const queryClient = useQueryClient();

  return useMutation<Partner, Error, UpdatePartnerRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<Partner>(`/partners/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/partners/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
  });
}
