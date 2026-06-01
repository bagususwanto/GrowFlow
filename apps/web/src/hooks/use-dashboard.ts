import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import { DashboardSummaryResponse } from '@growflow/types';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
};

export function useDashboardSummary() {
  return useQuery<DashboardSummaryResponse>({
    queryKey: dashboardKeys.summary(),
    queryFn: async () => {
      return apiClient.get<DashboardSummaryResponse>('/dashboard/summary');
    },
  });
}
