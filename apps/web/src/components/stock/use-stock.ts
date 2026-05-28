import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  StockBalance,
  StockMutation,
  PaginatedResponse,
  ListStockBalancesQuery,
  ListStockMutationsQuery,
} from '@growflow/types';

export const stockKeys = {
  all: ['stock'] as const,
  balances: () => [...stockKeys.all, 'balances'] as const,
  balanceList: (query: ListStockBalancesQuery) => [...stockKeys.balances(), query] as const,
  mutations: () => [...stockKeys.all, 'mutations'] as const,
  mutationList: (query: ListStockMutationsQuery) => [...stockKeys.mutations(), query] as const,
};

export function useStockBalances(query: ListStockBalancesQuery = {}) {
  return useQuery<PaginatedResponse<StockBalance>>({
    queryKey: stockKeys.balanceList(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<StockBalance>>(`/stock/balance?${params.toString()}`);
    },
  });
}

export function useStockMutations(query: ListStockMutationsQuery = {}) {
  return useQuery<PaginatedResponse<StockMutation>>({
    queryKey: stockKeys.mutationList(query),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<StockMutation>>(`/stock/mutations?${params.toString()}`);
    },
  });
}
