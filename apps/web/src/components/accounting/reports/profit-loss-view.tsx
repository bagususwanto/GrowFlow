'use client';

import React from 'react';
import { useProfitLoss } from '@web/hooks/use-accounting';
import { Card, CardContent, CardHeader, CardTitle } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { DatePicker } from '@web/components/ui/date-picker';
import { format } from 'date-fns';
import { Label } from '@web/components/ui/label';
import { Skeleton } from '@web/components/ui/skeleton';
import { Separator } from '@web/components/ui/separator';
import { RotateCcwIcon, TrendingUpIcon, TrendingDownIcon, FileSpreadsheetIcon, CalendarIcon } from 'lucide-react';

export function ProfitLossView() {
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [filter, setFilter] = React.useState<{ startDate?: string; endDate?: string }>({});

  const { data: report, isLoading, isError, error } = useProfitLoss(filter);

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  const netProfit = report?.netProfit || 0;
  const isNetProfitPositive = netProfit >= 0;

  return (
    <div className="space-y-6">
      {/* Header aligned with actions */}
      <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            Profit & Loss
          </h1>
          <p className="text-sm text-muted-foreground">
            Income statement outlining total revenues, operating expenses, and net net profit.
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <Card className="shadow-xs border-border/40 bg-muted/10">
        <CardContent className="p-4">
          <form onSubmit={handleRunReport} className="flex flex-wrap items-end gap-4">
            <DatePicker
              value={startDate}
              onChange={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="Start Date"
              className="h-9 w-40"
            />
            <DatePicker
              value={endDate}
              onChange={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
              placeholder="End Date"
              className="h-9 w-40"
            />
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
          </form>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="w-full h-80 lg:col-span-2" />
          <Skeleton className="w-full h-40" />
        </div>
      ) : isError || !report ? (
        <div className="p-8 text-center text-destructive font-medium border rounded-lg bg-card">
          {error instanceof Error ? error.message : 'Failed to calculate Profit & Loss.'}
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Statement */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileSpreadsheetIcon className="w-4 h-4 text-muted-foreground" />
                Income Statement (PSAK)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* REVENUE SECTION */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-muted-foreground">Revenues</h3>
                <div className="space-y-2.5 pl-2">
                  {report.revenues.length > 0 ? (
                    report.revenues.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-mono font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-xs pl-2 italic">No revenue transactions recorded.</div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-bold text-sm bg-muted/20 p-2 rounded">
                  <span className="uppercase text-xs tracking-wider">Total Revenues</span>
                  <span className="font-mono">{formatCurrency(report.totalRevenue)}</span>
                </div>
              </div>

              {/* EXPENSE SECTION */}
              <div className="space-y-3">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-muted-foreground pt-2">Expenses</h3>
                <div className="space-y-2.5 pl-2">
                  {report.expenses.length > 0 ? (
                    report.expenses.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-baseline gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <span className="font-mono font-medium">{formatCurrency(item.amount)}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-muted-foreground text-xs pl-2 italic">No expense transactions recorded.</div>
                  )}
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center font-bold text-sm bg-muted/20 p-2 rounded">
                  <span className="uppercase text-xs tracking-wider">Total Expenses</span>
                  <span className="font-mono">{formatCurrency(report.totalExpense)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Summary Cards */}
          <div className="space-y-6">
            <Card className={`border border-border/40 shadow-sm ${isNetProfitPositive ? 'bg-emerald-50/15' : 'bg-rose-50/15'}`}>
              <CardHeader className="pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Net Earnings</span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {isNetProfitPositive ? (
                    <TrendingUpIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <TrendingDownIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  )}
                  <h3 className={`text-2xl font-extrabold tracking-tight ${isNetProfitPositive ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                    {formatCurrency(netProfit)}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground leading-normal">
                  {isNetProfitPositive
                    ? 'The business has generated positive net income for the selected reporting period.'
                    : 'The business has incurred a net loss for the selected reporting period. Review expense distributions.'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Report Metrics</span>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-xs leading-normal">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Operating Ratio:</span>
                  <span className="font-bold text-foreground">
                    {report.totalRevenue > 0
                      ? ((report.totalExpense / report.totalRevenue) * 100).toFixed(1) + '%'
                      : '0.0%'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Profit Margin:</span>
                  <span className="font-bold text-foreground">
                    {report.totalRevenue > 0
                      ? ((report.netProfit / report.totalRevenue) * 100).toFixed(1) + '%'
                      : '0.0%'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
