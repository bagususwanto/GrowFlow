import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@web/lib/api-client';
import {
  Account,
  JournalEntry,
  AccountingSettings,
  CreateAccountRequest,
  UpdateAccountRequest,
  CreateJournalEntryRequest,
  UpdateAccountingSettingsRequest,
  TrialBalanceItem,
  ProfitLossReport,
  AgingReport,
  PaginatedResponse,
} from '@growflow/types';

export const accountingKeys = {
  all: ['accounting'] as const,
  accounts: () => [...accountingKeys.all, 'accounts'] as const,
  account: (id: string) => [...accountingKeys.accounts(), id] as const,
  journals: () => [...accountingKeys.all, 'journals'] as const,
  journal: (id: string) => [...accountingKeys.journals(), id] as const,
  settings: () => [...accountingKeys.all, 'settings'] as const,
  reports: () => [...accountingKeys.all, 'reports'] as const,
  trialBalance: (filter: any) => [...accountingKeys.reports(), 'trial-balance', filter] as const,
  profitLoss: (filter: any) => [...accountingKeys.reports(), 'profit-loss', filter] as const,
  apAging: (filter: any) => [...accountingKeys.reports(), 'ap-aging', filter] as const,
  arAging: (filter: any) => [...accountingKeys.reports(), 'ar-aging', filter] as const,
};

// --- Accounts Hooks ---

export function useAccounts(query: { search?: string; type?: string; category?: string } = {}) {
  return useQuery<Account[]>({
    queryKey: [...accountingKeys.accounts(), query],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      return apiClient.get<Account[]>(`/accounting/accounts?${params.toString()}`);
    },
  });
}

export function useAccount(id: string) {
  return useQuery<Account>({
    queryKey: accountingKeys.account(id),
    queryFn: async () => {
      return apiClient.get<Account>(`/accounting/accounts/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, CreateAccountRequest>({
    mutationFn: async (data) => {
      return apiClient.post<Account>('/accounting/accounts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() });
    },
  });
}

export function useUpdateAccount(id: string) {
  const queryClient = useQueryClient();
  return useMutation<Account, Error, UpdateAccountRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<Account>(`/accounting/accounts/${id}`, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.account(id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      return apiClient.delete<void>(`/accounting/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.accounts() });
    },
  });
}

// --- Journal Entries Hooks ---

export function useJournalEntries(query: {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
} = {}) {
  return useQuery<PaginatedResponse<JournalEntry>>({
    queryKey: [...accountingKeys.journals(), query],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      return apiClient.get<PaginatedResponse<JournalEntry>>(`/accounting/journal-entries?${params.toString()}`);
    },
  });
}

export function useJournalEntry(id: string) {
  return useQuery<JournalEntry>({
    queryKey: accountingKeys.journal(id),
    queryFn: async () => {
      return apiClient.get<JournalEntry>(`/accounting/journal-entries/${id}`);
    },
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, CreateJournalEntryRequest>({
    mutationFn: async (data) => {
      return apiClient.post<JournalEntry>('/accounting/journal-entries', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journals() });
    },
  });
}

export function usePostJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, string>({
    mutationFn: async (id) => {
      return apiClient.patch<JournalEntry>(`/accounting/journal-entries/${id}/post`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journal(data.id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.journals() });
    },
  });
}

export function useCancelJournalEntry() {
  const queryClient = useQueryClient();
  return useMutation<JournalEntry, Error, string>({
    mutationFn: async (id) => {
      return apiClient.patch<JournalEntry>(`/accounting/journal-entries/${id}/cancel`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.journal(data.id) });
      queryClient.invalidateQueries({ queryKey: accountingKeys.journals() });
    },
  });
}

// --- Accounting Settings Hooks ---

export function useAccountingSettings() {
  return useQuery<AccountingSettings>({
    queryKey: accountingKeys.settings(),
    queryFn: async () => {
      return apiClient.get<AccountingSettings>('/accounting/settings');
    },
  });
}

export function useUpdateAccountingSettings() {
  const queryClient = useQueryClient();
  return useMutation<AccountingSettings, Error, UpdateAccountingSettingsRequest>({
    mutationFn: async (data) => {
      return apiClient.patch<AccountingSettings>('/accounting/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountingKeys.settings() });
    },
  });
}

// --- Reports Hooks ---

export function useTrialBalance(filter: { startDate?: string; endDate?: string } = {}) {
  return useQuery<TrialBalanceItem[]>({
    queryKey: accountingKeys.trialBalance(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      return apiClient.get<TrialBalanceItem[]>(`/accounting/reports/trial-balance?${params.toString()}`);
    },
  });
}

export function useProfitLoss(filter: { startDate?: string; endDate?: string } = {}) {
  return useQuery<ProfitLossReport>({
    queryKey: accountingKeys.profitLoss(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.startDate) params.append('startDate', filter.startDate);
      if (filter.endDate) params.append('endDate', filter.endDate);
      return apiClient.get<ProfitLossReport>(`/accounting/reports/profit-loss?${params.toString()}`);
    },
  });
}

export function useAPAging(filter: { asOf?: string } = {}) {
  return useQuery<AgingReport>({
    queryKey: accountingKeys.apAging(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.asOf) params.append('asOf', filter.asOf);
      return apiClient.get<AgingReport>(`/accounting/reports/ap-aging?${params.toString()}`);
    },
  });
}

export function useARAging(filter: { asOf?: string } = {}) {
  return useQuery<AgingReport>({
    queryKey: accountingKeys.arAging(filter),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter.asOf) params.append('asOf', filter.asOf);
      return apiClient.get<AgingReport>(`/accounting/reports/ar-aging?${params.toString()}`);
    },
  });
}
