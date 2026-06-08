'use client';

import React from 'react';
import {
  useAccountingSettings,
  useUpdateAccountingSettings,
  useAccounts,
} from '@web/hooks/use-accounting';
import { useAuthStore } from '@web/stores/auth.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Label } from '@web/components/ui/label';
import { Combobox } from '@web/components/ui/combobox';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { SettingsIcon, ShieldAlertIcon, SaveIcon } from 'lucide-react';

export function AccountingSettingsForm() {
  const user = useAuthStore((state) => state.user);
  const isSuperadmin = user?.role === 'superadmin';

  // Fetch data
  const { data: settings, isLoading: isSettingsLoading } = useAccountingSettings();
  const { data: accounts = [], isLoading: isAccountsLoading } = useAccounts();
  const updateMutation = useUpdateAccountingSettings();

  // Form states
  const [apAccountId, setApAccountId] = React.useState('');
  const [arAccountId, setArAccountId] = React.useState('');
  const [cashAccountId, setCashAccountId] = React.useState('');
  const [inventoryAccountId, setInventoryAccountId] = React.useState('');
  const [cogsAccountId, setCogsAccountId] = React.useState('');
  const [revenueAccountId, setRevenueAccountId] = React.useState('');
  const [purchaseAccountId, setPurchaseAccountId] = React.useState('');

  // Sync state with settings response
  React.useEffect(() => {
    if (settings) {
      setApAccountId(settings.apAccountId || '');
      setArAccountId(settings.arAccountId || '');
      setCashAccountId(settings.cashAccountId || '');
      setInventoryAccountId(settings.inventoryAccountId || '');
      setCogsAccountId(settings.cogsAccountId || '');
      setRevenueAccountId(settings.revenueAccountId || '');
      setPurchaseAccountId(settings.purchaseAccountId || '');
    }
  }, [settings]);

  // Sort accounts by code for cleaner lists
  const sortedAccounts = React.useMemo(() => {
    return [...accounts].sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts]);

  // Memoize combobox options by account types
  const liabilityAccountOptions = React.useMemo(() => {
    return sortedAccounts
      .filter((a) => a.type === 'LIABILITY')
      .map((a) => ({
        value: a.id,
        label: `${a.code} | ${a.name}`,
        searchKeywords: `${a.code} ${a.name}`,
      }));
  }, [sortedAccounts]);

  const assetAccountOptions = React.useMemo(() => {
    return sortedAccounts
      .filter((a) => a.type === 'ASSET')
      .map((a) => ({
        value: a.id,
        label: `${a.code} | ${a.name}`,
        searchKeywords: `${a.code} ${a.name}`,
      }));
  }, [sortedAccounts]);

  const expenseAccountOptions = React.useMemo(() => {
    return sortedAccounts
      .filter((a) => a.type === 'EXPENSE')
      .map((a) => ({
        value: a.id,
        label: `${a.code} | ${a.name}`,
        searchKeywords: `${a.code} ${a.name}`,
      }));
  }, [sortedAccounts]);

  const revenueAccountOptions = React.useMemo(() => {
    return sortedAccounts
      .filter((a) => a.type === 'REVENUE')
      .map((a) => ({
        value: a.id,
        label: `${a.code} | ${a.name}`,
        searchKeywords: `${a.code} ${a.name}`,
      }));
  }, [sortedAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperadmin) {
      toast.error('Only superadmin roles are authorized to modify default COA settings.');
      return;
    }

    const payload = {
      apAccountId,
      arAccountId,
      cashAccountId,
      inventoryAccountId,
      cogsAccountId,
      revenueAccountId,
      purchaseAccountId,
    };

    try {
      await updateMutation.mutateAsync(payload);
      toast.success('Default account mappings updated successfully');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update accounting settings';
      toast.error(errorMsg);
    }
  };

  const isLoading = isSettingsLoading || isAccountsLoading;

  if (isLoading) return <Skeleton className="w-full h-96" />;

  if (!isSuperadmin) {
    return (
      <Card className="border-rose-500/30 bg-rose-50/15 max-w-2xl mx-auto shadow-sm">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <ShieldAlertIcon className="w-12 h-12 text-rose-500" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400">Access Denied</h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              You do not have the required permissions to access this page. Accounting configurations are restricted to system administrators (`superadmin`) to protect ledger integrity.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          Accounting Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Map your Chart of Accounts (COA) to standard system transactions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-muted-foreground" />
              Default Accounts Mapping
            </CardTitle>
            <CardDescription className="text-xs">
              System modules use these mappings to generate automatic posted journal entries.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* AP Account */}
              <div className="space-y-2">
                <Label htmlFor="apAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Accounts Payable (Hutang Dagang)</Label>
                <Combobox
                  value={apAccountId}
                  onChange={(val) => setApAccountId(val || '')}
                  options={liabilityAccountOptions}
                  placeholder="Select AP account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Credited automatically when a vendor bill is RECEIVED.</p>
              </div>

              {/* AR Account */}
              <div className="space-y-2">
                <Label htmlFor="arAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Accounts Receivable (Piutang Dagang)</Label>
                <Combobox
                  value={arAccountId}
                  onChange={(val) => setArAccountId(val || '')}
                  options={assetAccountOptions}
                  placeholder="Select AR account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Debited automatically when a sales invoice is SENT.</p>
              </div>

              {/* Cash Account */}
              <div className="space-y-2">
                <Label htmlFor="cashAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Cash / Bank Account (Kas default)</Label>
                <Combobox
                  value={cashAccountId}
                  onChange={(val) => setCashAccountId(val || '')}
                  options={assetAccountOptions}
                  placeholder="Select cash account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Impacted when recording AP/AR cash payments.</p>
              </div>

              {/* Inventory Account */}
              <div className="space-y-2">
                <Label htmlFor="inventoryAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Inventory Account (Persediaan)</Label>
                <Combobox
                  value={inventoryAccountId}
                  onChange={(val) => setInventoryAccountId(val || '')}
                  options={assetAccountOptions}
                  placeholder="Select inventory account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Debited during inventory valuation receipt mutations.</p>
              </div>

              {/* COGS Account */}
              <div className="space-y-2">
                <Label htmlFor="cogsAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">COGS Account (Harga Pokok Penjualan)</Label>
                <Combobox
                  value={cogsAccountId}
                  onChange={(val) => setCogsAccountId(val || '')}
                  options={expenseAccountOptions}
                  placeholder="Select COGS account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Debited when items are delivered to customers.</p>
              </div>

              {/* Revenue Account */}
              <div className="space-y-2">
                <Label htmlFor="revenueAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Sales Revenue Account (Pendapatan)</Label>
                <Combobox
                  value={revenueAccountId}
                  onChange={(val) => setRevenueAccountId(val || '')}
                  options={revenueAccountOptions}
                  placeholder="Select revenue account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Credited automatically when customer invoices are sent.</p>
              </div>

              {/* Purchase Account */}
              <div className="space-y-2">
                <Label htmlFor="purchaseAccountId" className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Purchase / Expense Account (Beban)</Label>
                <Combobox
                  value={purchaseAccountId}
                  onChange={(val) => setPurchaseAccountId(val || '')}
                  options={expenseAccountOptions}
                  placeholder="Select purchase account..."
                  searchPlaceholder="Search account..."
                  emptyMessage="No accounts found."
                />
                <p className="text-[10px] text-muted-foreground">Debited automatically when vendor bills are RECEIVED.</p>
              </div>

            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button type="submit" disabled={updateMutation.isPending} className="shadow-xs">
                <SaveIcon className="w-4 h-4 mr-2" />
                {updateMutation.isPending ? 'Saving Settings...' : 'Save Settings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

