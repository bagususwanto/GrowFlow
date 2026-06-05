'use client';

import React from 'react';
import { useTrialBalance } from '@web/hooks/use-accounting';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@web/components/ui/table';
import { Badge } from '@web/components/ui/badge';
import { Skeleton } from '@web/components/ui/skeleton';
import { RotateCcwIcon, CheckCircle2Icon, AlertCircleIcon, CalendarIcon } from 'lucide-react';

export function TrialBalanceView() {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [filter, setFilter] = React.useState<{ startDate?: string; endDate?: string }>({});

  const { data: report = [], isLoading, isError, error } = useTrialBalance(filter);

  const handleRunReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setFilter({});
  };

  // Calculate totals
  const totalDebit = React.useMemo(() => {
    return report.reduce((sum, item) => sum + Number(item.totalDebit), 0);
  }, [report]);

  const totalCredit = React.useMemo(() => {
    return report.reduce((sum, item) => sum + Number(item.totalCredit), 0);
  }, [report]);

  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Trial Balance
          </h1>
          <p className="text-sm text-muted-foreground">
            Summary of all ledger account balances to audit double-entry consistency.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-xs border-border/40 bg-muted/10">
        <CardContent className="p-4">
          <form onSubmit={handleRunReport} className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold text-muted-foreground">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9 w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold text-muted-foreground">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 w-40"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="h-9">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                Run Report
              </Button>
              {(startDate || endDate) && (
                <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-9 text-xs">
                  <RotateCcwIcon className="w-3.5 h-3.5 mr-1" />
                  Reset
                </Button>
              )}
            </div>

            {/* Live Balance Status Badge */}
            {!isLoading && report.length > 0 && (
              <div className="ml-auto flex items-center">
                {isBalanced ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold gap-1 py-1">
                    <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500" />
                    Ledger Balanced
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="font-semibold gap-1 py-1">
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                    Unbalanced Ledger!
                  </Badge>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Trial Balance Table */}
      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[150px] font-semibold">Account Code</TableHead>
                  <TableHead className="font-semibold">Account Name</TableHead>
                  <TableHead className="w-[120px] font-semibold">Type</TableHead>
                  <TableHead className="w-[160px] text-right font-semibold">Total Debit</TableHead>
                  <TableHead className="w-[160px] text-right font-semibold">Total Credit</TableHead>
                  <TableHead className="w-[160px] text-right font-semibold">Net Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 12 }).map((_, i) => (
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
                    <TableCell colSpan={6} className="h-24 text-destructive text-center font-medium">
                      {error instanceof Error ? error.message : 'Failed to calculate Trial Balance.'}
                    </TableCell>
                  </TableRow>
                ) : report.length > 0 ? (
                  <>
                    {report.map((item) => {
                      const netBalance = item.balance;
                      const normalSide = item.account.type === 'ASSET' || item.account.type === 'EXPENSE' ? 'Dr' : 'Cr';
                      
                      return (
                        <TableRow key={item.account.id}>
                          <TableCell className="font-mono text-xs font-semibold">{item.account.code}</TableCell>
                          <TableCell className="font-medium text-foreground">{item.account.name}</TableCell>
                          <TableCell className="capitalize text-xs text-muted-foreground">{item.account.type.toLowerCase()}</TableCell>
                          <TableCell className="text-right font-mono text-xs font-medium">
                            {Number(item.totalDebit) > 0 ? formatCurrency(item.totalDebit) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-medium">
                            {Number(item.totalCredit) > 0 ? formatCurrency(item.totalCredit) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs font-semibold text-foreground">
                            {formatCurrency(Math.abs(netBalance))} <span className="text-[10px] text-muted-foreground ml-0.5">{netBalance >= 0 ? normalSide : (normalSide === 'Dr' ? 'Cr' : 'Dr')}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {/* Totals Row */}
                    <TableRow className="bg-muted/10 font-bold border-t border-border/70">
                      <TableCell colSpan={3} className="p-3 text-right uppercase tracking-wider text-xs text-foreground">
                        Report Totals
                      </TableCell>
                      <TableCell className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(totalDebit)}
                      </TableCell>
                      <TableCell className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(totalCredit)}
                      </TableCell>
                      <TableCell className="p-3 text-right font-mono text-foreground text-xs uppercase text-muted-foreground">
                        {isBalanced ? 'Balanced' : 'Difference: ' + formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-muted-foreground text-center">
                      No ledger transactions found in the selected period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
