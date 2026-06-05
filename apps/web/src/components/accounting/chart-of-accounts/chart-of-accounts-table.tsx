'use client';

import * as React from 'react';
import {
  useAccounts,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
} from '@web/hooks/use-accounting';
import { Account, AccountType, AccountCategory } from '@growflow/types';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Skeleton } from '@web/components/ui/skeleton';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@web/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@web/components/ui/table';
import { Badge } from '@web/components/ui/badge';
import { toast } from 'sonner';
import { PlusIcon, EditIcon, Trash2Icon, SearchIcon, LandmarkIcon } from 'lucide-react';
import { useConfirm } from '@web/hooks/use-confirm';

const ACCOUNT_TYPES = [
  { value: 'ASSET', label: 'Asset' },
  { value: 'LIABILITY', label: 'Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'EXPENSE', label: 'Expense' },
];

const ACCOUNT_CATEGORIES = [
  { value: 'CURRENT_ASSET', label: 'Current Asset' },
  { value: 'FIXED_ASSET', label: 'Fixed Asset' },
  { value: 'CURRENT_LIABILITY', label: 'Current Liability' },
  { value: 'LONG_TERM_LIABILITY', label: 'Long Term Liability' },
  { value: 'EQUITY', label: 'Equity' },
  { value: 'REVENUE', label: 'Revenue' },
  { value: 'COGS', label: 'Cost of Goods Sold (COGS)' },
  { value: 'OPERATING_EXPENSE', label: 'Operating Expense' },
  { value: 'OTHER_EXPENSE', label: 'Other Expense' },
  { value: 'OTHER_INCOME', label: 'Other Income' },
];

export function ChartOfAccountsTable() {
  const confirm = useConfirm();
  const [search, setSearch] = React.useState('');

  // Fetch Accounts
  const { data: accounts = [], isLoading, isError, error } = useAccounts();

  // Mutations
  const createMutation = useCreateAccount();
  const deleteMutation = useDeleteAccount();

  // Modal Dialog States
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState<Account | null>(null);

  // Form Fields
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<AccountType>('ASSET');
  const [category, setCategory] = React.useState<AccountCategory>('CURRENT_ASSET');
  const [parentId, setParentId] = React.useState<string>('none');

  // Helper for hierarchy depth
  const getDepth = React.useCallback(
    (account: Account): number => {
      let depth = 0;
      let currParentId = account.parentId;
      while (currParentId) {
        const parent = accounts.find((a) => a.id === currParentId);
        if (!parent) break;
        depth++;
        currParentId = parent.parentId;
      }
      return depth;
    },
    [accounts]
  );

  const handleNewAccount = () => {
    setSelectedAccount(null);
    setCode('');
    setName('');
    setType('ASSET');
    setCategory('CURRENT_ASSET');
    setParentId('none');
    setIsOpen(true);
  };

  const handleEditAccount = (acc: Account) => {
    setSelectedAccount(acc);
    setCode(acc.code);
    setName(acc.name);
    setType(acc.type);
    setCategory(acc.category);
    setParentId(acc.parentId || 'none');
    setIsOpen(true);
  };

  const handleDeleteAccount = async (acc: Account) => {
    if (acc.isSystemAccount) {
      toast.error('System accounts cannot be deleted');
      return;
    }
    const hasChildren = accounts.some((a) => a.parentId === acc.id);
    if (hasChildren) {
      toast.error('Cannot delete an account that has child sub-accounts');
      return;
    }

    const ok = await confirm({
      title: 'Delete COA Account',
      description: (
        <>
          Are you sure you want to delete <span className="font-bold">{acc.code} — {acc.name}</span>? This action cannot be undone and will fail if the account has journal ledger records.
        </>
      ),
      confirmText: 'Delete Account',
      variant: 'destructive',
    });

    if (ok) {
      toast.promise(deleteMutation.mutateAsync(acc.id), {
        loading: `Deleting account ${acc.code}...`,
        success: `Account ${acc.code} deleted successfully`,
        error: (err) => err?.message || 'Failed to delete account. Make sure it has no transactions.',
      });
    }
  };

  const updateAccountMut = useUpdateAccount(selectedAccount?.id || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) {
      toast.error('Code and Name are required');
      return;
    }

    const payload = {
      code,
      name,
      type,
      category,
      parentId: parentId === 'none' ? null : parentId,
    };

    try {
      if (selectedAccount) {
        await updateAccountMut.mutateAsync(payload);
        toast.success(`Account ${code} updated successfully`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`Account ${code} created successfully`);
      }
      setIsOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Operation failed';
      toast.error(errorMsg);
    }
  };

  // Filter accounts by search query (code or name match)
  const filteredAccounts = React.useMemo(() => {
    if (!search.trim()) return accounts;
    const query = search.toLowerCase();
    return accounts.filter(
      (a) => a.code.toLowerCase().includes(query) || a.name.toLowerCase().includes(query)
    );
  }, [accounts, search]);

  // Sort accounts. The API or seeder handles default structure, but sorting by code is standard.
  const sortedAccounts = React.useMemo(() => {
    return [...filteredAccounts].sort((a, b) => a.code.localeCompare(b.code));
  }, [filteredAccounts]);

  // Format type labels
  const getTypeBadgeClass = (t: string) => {
    switch (t) {
      case 'ASSET':
        return 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20';
      case 'LIABILITY':
        return 'border-rose-500/30 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/20';
      case 'EQUITY':
        return 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20';
      case 'REVENUE':
        return 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20';
      case 'EXPENSE':
        return 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        {/* Search & Actions Bar */}
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 mb-4">
          <div className="relative w-full sm:w-64">
            <SearchIcon className="top-2.5 left-2.5 absolute w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search account code or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9"
            />
          </div>
          <Button size="sm" onClick={handleNewAccount}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>

        {/* Tree Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[180px] font-semibold">Account Code</TableHead>
                <TableHead className="font-semibold">Account Name</TableHead>
                <TableHead className="w-[120px] font-semibold">Type</TableHead>
                <TableHead className="w-[180px] font-semibold">Category</TableHead>
                <TableHead className="w-[120px] font-semibold">Usage</TableHead>
                <TableHead className="w-[100px] text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="w-full h-6" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 font-medium text-destructive text-center"
                  >
                    {error instanceof Error ? error.message : 'Failed to load accounts.'}
                  </TableCell>
                </TableRow>
              ) : sortedAccounts.length ? (
                sortedAccounts.map((acc) => {
                  const depth = getDepth(acc);
                  const isHeader = acc.code.endsWith('-0000') || acc.code.endsWith('-000');
                  return (
                    <TableRow key={acc.id} className={isHeader ? 'bg-muted/10 font-semibold' : ''}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {acc.code}
                      </TableCell>
                      <TableCell>
                        <div
                          style={{ paddingLeft: `${depth * 16}px` }}
                          className="flex items-center gap-1.5"
                        >
                          {depth > 0 && (
                            <span className="text-muted-foreground/35 font-mono text-xs select-none">
                              └─
                            </span>
                          )}
                          {isHeader && <LandmarkIcon className="w-3.5 h-3.5 text-muted-foreground" />}
                          <span className={isHeader ? 'font-semibold' : 'text-muted-foreground/90 font-medium'}>{acc.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${getTypeBadgeClass(acc.type)}`}>
                          {acc.type.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground capitalize">
                        {acc.category.toLowerCase().replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell>
                        {acc.isSystemAccount ? (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 font-semibold border-transparent text-[10px] uppercase">
                            System
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">Custom</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="w-8 h-8 text-muted-foreground"
                            onClick={() => handleEditAccount(acc)}
                          >
                            <EditIcon className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={acc.isSystemAccount}
                            className={`w-8 h-8 ${acc.isSystemAccount ? 'text-muted-foreground/30' : 'text-destructive hover:bg-destructive/10'}`}
                            onClick={() => handleDeleteAccount(acc)}
                          >
                            <Trash2Icon className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-muted-foreground text-center"
                  >
                    No accounts found. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Create / Edit Account Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedAccount ? 'Edit Account Details' : 'Create New Account'}</DialogTitle>
            <DialogDescription>
              {selectedAccount
                ? 'Update fields below. System accounts cannot change their code.'
                : 'Add a new ledger account to your Chart of Accounts.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="1-1100"
                  required
                  disabled={selectedAccount?.isSystemAccount}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  placeholder="Kas Kecil IDR"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type">Account Type</Label>
                <Select value={type} onValueChange={(val) => setType(val || 'ASSET')} disabled={selectedAccount?.isSystemAccount}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={(val) => setCategory(val || 'CURRENT_ASSET')} disabled={selectedAccount?.isSystemAccount}>
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="parentId">Parent Header Account</Label>
              <Select value={parentId} onValueChange={(val) => setParentId(val || 'none')} disabled={selectedAccount?.isSystemAccount}>
                <SelectTrigger id="parentId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Account)</SelectItem>
                  {accounts
                    // Filter headers to prevent nested parent cycles
                    .filter((a) => (a.code.endsWith('-0000') || a.code.endsWith('-000')) && a.id !== selectedAccount?.id)
                    .map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} — {a.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateAccountMut.isPending}>
                {createMutation.isPending || updateAccountMut.isPending ? 'Saving...' : 'Save Account'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
