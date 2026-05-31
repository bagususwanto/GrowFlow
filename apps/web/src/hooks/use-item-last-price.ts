import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import { ItemLastPriceResponse } from '@growflow/types';

export const itemPriceKeys = {
  all: ['item-prices'] as const,
  lastPrice: (itemId: string, type: 'purchase' | 'sales') => [...itemPriceKeys.all, 'last', itemId, type] as const,
};

export function useItemLastPrice(itemId: string | undefined | null, type: 'purchase' | 'sales') {
  return useQuery<ItemLastPriceResponse>({
    queryKey: itemPriceKeys.lastPrice(itemId || '', type),
    queryFn: async () => {
      if (!itemId) return { unitPrice: null };
      return apiClient.get<ItemLastPriceResponse>(`/items/${itemId}/last-price?type=${type}`);
    },
    enabled: !!itemId,
    staleTime: 0, // We want the latest price on selection, but queries cached within standard time is okay
  });
}
