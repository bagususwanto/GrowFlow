'use client';

import React from 'react';
import { useAPAging, useARAging } from '@web/hooks/use-accounting';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { DatePicker } from '@web/components/ui/date-picker';
import { format } from 'date-fns';
import { Label } from '@web/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@web/components/ui/table';
import { Skeleton } from '@web/components/ui/skeleton';
import { RotateCcwIcon, CalendarIcon } from 'lucide-react';

interface AgingReportViewProps {
  type: 'AP' | 'AR';
}

export function AgingReportView({ type }: AgingReportViewProps) {
  const [asOf, setAsOf] = React.useState(new Date().toISOString().split('T')[0]);
  const [filter, setFilter] = React.useState<{ asOf?: string }>({});

  const apQuery = useAPAging(filter);
  const arQuery = useARAging(filter);

  const { data: report, isLoading, isError, error } = type === 'AP' ? apQuery : arQuery;

  const handleRunReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFilter({ asOf: asOf || undefined });
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setAsOf(today);
    setFilter({});
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const title = type === 'AP' ? 'Accounts Payable (AP) Aging' : 'Accounts Receivable (AR) Aging';
  const description = type === 'AP'
    ? 'Categorizes outstanding vendor bills based on days overdue since their billing terms.'
    : 'Categorizes outstanding customer invoices based on days overdue since their billing terms.';

  const partnerHeader = type === 'AP' ? 'Supplier' : 'Customer';

  return (
    <div className="space-y-6">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-xs border-border/40 bg-muted/10">
        <CardContent className="p-4">
          <form onSubmit={handleRunReport} className="flex flex-wrap items-end gap-4">
            <DatePicker
              value={asOf}
              onChange={(date) => setAsOf(date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="As Of Date"
              className="h-9 w-40"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" size="sm" className="h-9">
                <CalendarIcon className="w-4 h-4 mr-1.5" />
                Run Report
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={handleReset} className="h-9 text-xs">
                <RotateCcwIcon className="w-3.5 h-3.5 mr-1" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Aging Table */}
      <Card>
        <CardContent className="p-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">{partnerHeader}</TableHead>
                  <TableHead className="w-[130px] text-right font-semibold">Current</TableHead>
                  <TableHead className="w-[130px] text-right font-semibold">1 - 30 Days</TableHead>
                  <TableHead className="w-[130px] text-right font-semibold">31 - 60 Days</TableHead>
                  <TableHead className="w-[130px] text-right font-semibold">61 - 90 Days</TableHead>
                  <TableHead className="w-[130px] text-right font-semibold">&gt; 90 Days</TableHead>
                  <TableHead className="w-[150px] text-right font-semibold">Total Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="w-full h-6" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-destructive text-center font-medium">
                      {error instanceof Error ? error.message : 'Failed to calculate aging report.'}
                    </TableCell>
                  </TableRow>
                ) : report && report.items && report.items.length > 0 ? (
                  <>
                    {report.items.map((item) => (
                      <TableRow key={item.partnerId}>
                        <td className="p-3">
                          <div className="font-semibold">{item.partnerName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.partnerCode}</div>
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {item.current > 0 ? formatCurrency(item.current) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {item.bucket1To30 > 0 ? formatCurrency(item.bucket1To30) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {item.bucket31To60 > 0 ? formatCurrency(item.bucket31To60) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-xs">
                          {item.bucket61To90 > 0 ? formatCurrency(item.bucket61To90) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                          {item.bucketOver90 > 0 ? formatCurrency(item.bucketOver90) : '-'}
                        </td>
                        <td className="p-3 text-right font-mono text-xs font-bold text-foreground">
                          {formatCurrency(item.total)}
                        </td>
                      </TableRow>
                    ))}

                    {/* Totals Row */}
                    <TableRow className="bg-muted/10 font-bold border-t border-border/70">
                      <td className="p-3 text-left uppercase tracking-wider text-xs text-foreground">
                        Total Aging Balances
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(report.totals.current)}
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(report.totals.bucket1To30)}
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(report.totals.bucket31To60)}
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(report.totals.bucket61To90)}
                      </td>
                      <td className="p-3 text-right font-mono text-rose-600 dark:text-rose-400">
                        {formatCurrency(report.totals.bucketOver90)}
                      </td>
                      <td className="p-3 text-right font-mono text-foreground">
                        {formatCurrency(report.totals.total)}
                      </td>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-muted-foreground text-center">
                      No outstanding aging balances. All invoice lines settled!
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
