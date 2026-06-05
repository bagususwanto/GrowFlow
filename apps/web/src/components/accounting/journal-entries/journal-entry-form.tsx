'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAccounts, useCreateJournalEntry } from '@web/hooks/use-accounting';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { DatePicker } from '@web/components/ui/date-picker';
import { format } from 'date-fns';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import { toast } from 'sonner';
import { PlusIcon, Trash2Icon, ChevronLeftIcon, AlertCircleIcon, CheckSquareIcon } from 'lucide-react';
import Link from 'next/link';

interface JournalLineInput {
  accountId: string;
  debit: string;
  credit: string;
  description: string;
}

export function JournalEntryForm() {
  const router = useRouter();
  const createMutation = useCreateJournalEntry();
  const { data: accounts = [] } = useAccounts();

  // Sort accounts by code for the dropdown list
  const sortedAccounts = React.useMemo(() => {
    return [...accounts].sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts]);

  // Form states
  const [entryDate, setEntryDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = React.useState('');
  const [lines, setLines] = React.useState<JournalLineInput[]>([
    { accountId: '', debit: '', credit: '', description: '' },
    { accountId: '', debit: '', credit: '', description: '' },
  ]);

  const addLine = () => {
    setLines([...lines, { accountId: '', debit: '', credit: '', description: '' }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error('A journal entry must contain at least 2 lines.');
      return;
    }
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const updateLine = (index: number, field: keyof JournalLineInput, value: string) => {
    const newLines = [...lines];
    
    if (field === 'debit') {
      newLines[index].debit = value;
      if (parseFloat(value) > 0) {
        newLines[index].credit = ''; // Mutual exclusivity
      }
    } else if (field === 'credit') {
      newLines[index].credit = value;
      if (parseFloat(value) > 0) {
        newLines[index].debit = ''; // Mutual exclusivity
      }
    } else {
      newLines[index][field] = value;
    }
    
    setLines(newLines);
  };

  // Calculations
  const totalDebit = React.useMemo(() => {
    return lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  }, [lines]);

  const totalCredit = React.useMemo(() => {
    return lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  }, [lines]);

  const difference = React.useMemo(() => {
    return Math.abs(totalDebit - totalCredit);
  }, [totalDebit, totalCredit]);

  const isBalanced = totalDebit > 0 && totalCredit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;
  const isFormValid = React.useMemo(() => {
    if (!entryDate || !isBalanced) return false;
    // Check that every line has a valid account, and either debit or credit is > 0
    return lines.every((line) => {
      const db = parseFloat(line.debit) || 0;
      const cr = parseFloat(line.credit) || 0;
      return line.accountId !== '' && (db > 0 || cr > 0);
    });
  }, [entryDate, isBalanced, lines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) {
      toast.error('Debits and Credits are not balanced.');
      return;
    }
    if (!isFormValid) {
      toast.error('Please fill in all required fields. Each line needs an account and a debit or credit amount.');
      return;
    }

    const payload = {
      entryDate,
      description: description || undefined,
      lines: lines.map((line) => ({
        accountId: line.accountId,
        debit: parseFloat(line.debit) || 0,
        credit: parseFloat(line.credit) || 0,
        description: line.description || undefined,
      })),
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Journal entry created successfully as DRAFT');
      router.push('/accounting/journal-entries');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create journal entry';
      toast.error(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            type="button"
            nativeButton={false}
            render={
              <Link href="/accounting/journal-entries" title="Back to Journal Entries">
                <ChevronLeftIcon className="h-4 w-4" />
              </Link>
            }
          />
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
              New Manual Journal
            </h1>
            <p className="text-sm text-muted-foreground">
              Prepare a manual double-entry ledger adjustment. It will save as DRAFT.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="submit"
            disabled={!isFormValid || createMutation.isPending}
            className="shadow-xs"
          >
            {createMutation.isPending ? 'Saving...' : 'Save as Draft'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Lines Input */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b">
                  <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                    <th className="p-3 w-[260px]">Account</th>
                    <th className="p-3">Memo / Description</th>
                    <th className="p-3 w-[130px] text-right">Debit</th>
                    <th className="p-3 w-[130px] text-right">Credit</th>
                    <th className="p-3 w-[50px] text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {lines.map((line, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <Select
                          value={line.accountId}
                          onValueChange={(val) => updateLine(index, 'accountId', val || '')}
                        >
                          <SelectTrigger className="w-full h-8 text-xs font-medium">
                            <SelectValue placeholder="Select account..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {sortedAccounts.map((acc) => (
                              <SelectItem key={acc.id} value={acc.id} className="text-xs">
                                <span className="font-mono font-semibold mr-1.5">{acc.code}</span>
                                {acc.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input
                          value={line.description}
                          onChange={(e) => updateLine(index, 'description', e.target.value)}
                          placeholder="Line description..."
                          className="h-8 text-xs"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={line.debit}
                          onChange={(e) => updateLine(index, 'debit', e.target.value)}
                          placeholder="0.00"
                          className="h-8 text-xs text-right font-mono font-semibold"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={line.credit}
                          onChange={(e) => updateLine(index, 'credit', e.target.value)}
                          placeholder="0.00"
                          className="h-8 text-xs text-right font-mono font-semibold"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          type="button"
                          className="w-7 h-7 text-destructive hover:bg-destructive/10"
                          onClick={() => removeLine(index)}
                        >
                          <Trash2Icon className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {/* Totals Row */}
                  <tr className="bg-muted/10 font-bold border-t border-border/70">
                    <td colSpan={2} className="p-3 text-right text-xs uppercase tracking-wider text-muted-foreground">
                      Totals
                    </td>
                    <td className="p-3 text-right font-mono text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalDebit)}
                    </td>
                    <td className="p-3 text-right font-mono text-foreground">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalCredit)}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
              className="text-xs"
            >
              <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Journal Line
            </Button>
          </CardContent>
        </Card>

        {/* Info Sidebar & Warning Banner */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entryDate">Journal Date</Label>
                <DatePicker
                  value={entryDate}
                  onChange={(date) => setEntryDate(date ? format(date, 'yyyy-MM-dd') : '')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Journal Description / Memo</Label>
                <Textarea
                  id="description"
                  placeholder="Explain the purpose of this adjustment..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Balance validation alert */}
          {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
            <Card className="border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400">
              <CardContent className="p-4 flex gap-2.5 items-start">
                <AlertCircleIcon className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm leading-tight">Journal is out of balance!</h4>
                  <p className="text-xs leading-relaxed text-rose-600 dark:text-rose-400">
                    The total debit ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalDebit)}) does not equal total credit ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalCredit)}).
                  </p>
                  <p className="text-xs font-bold font-mono mt-1">
                    Difference: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(difference)}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {isBalanced && totalDebit > 0 && (
            <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400">
              <CardContent className="p-4 flex gap-2.5 items-start">
                <CheckSquareIcon className="w-5 h-5 shrink-0 text-emerald-500 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm leading-tight">Journal is balanced</h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Ledger balance is ready to be saved as a draft.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </form>
  );
}
