'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@web/components/ui/dialog';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { DatePicker } from '@web/components/ui/date-picker';
import { format } from 'date-fns';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; paymentDate?: string; note?: string }) => void;
  maxAmount: number;
  isPending: boolean;
}

export function RecordPaymentModal({ isOpen, onClose, onSubmit, maxAmount, isPending }: RecordPaymentModalProps) {
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<{
    amount: number;
    paymentDate: string;
    note: string;
  }>({
    defaultValues: {
      amount: maxAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        amount: maxAmount,
        paymentDate: new Date().toISOString().split('T')[0],
        note: '',
      });
    }
  }, [isOpen, maxAmount, reset]);

  const onFormSubmit = (data: { amount: number; paymentDate: string; note: string }) => {
    onSubmit({
      amount: Number(data.amount),
      paymentDate: data.paymentDate ? new Date(data.paymentDate).toISOString() : undefined,
      note: data.note || undefined,
    });
  };

  const handlePayFull = () => {
    setValue('amount', maxAmount);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record customer payment transaction. Sisa tagihan outstanding: <span className="font-bold text-foreground">{formatCurrency(maxAmount)}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Payment Amount (IDR)</Label>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-amber-600 hover:text-amber-500" onClick={handlePayFull}>
                Pay Full
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0"
              {...register('amount', {
                required: 'Payment amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: { value: maxAmount, message: `Amount cannot exceed outstanding balance (${formatCurrency(maxAmount)})` },
              })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Controller
              name="paymentDate"
              control={control}
              rules={{ required: 'Payment date is required' }}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                />
              )}
            />
            {errors.paymentDate && (
              <p className="text-xs text-destructive">{errors.paymentDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes</Label>
            <Textarea
              id="note"
              placeholder="e.g. Bank Transfer BCA, Cash Payment, etc."
              {...register('note')}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white" disabled={isPending}>
              {isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
