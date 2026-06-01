'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@web/components/ui/dialog';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';

interface CreateCreditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; reason: string; note?: string }) => void;
  maxAmount: number;
  isPending: boolean;
}

export function CreateCreditNoteModal({ isOpen, onClose, onSubmit, maxAmount, isPending }: CreateCreditNoteModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{
    amount: number;
    reason: string;
    note: string;
  }>({
    defaultValues: {
      amount: maxAmount,
      reason: '',
      note: '',
    },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        amount: maxAmount,
        reason: '',
        note: '',
      });
    }
  }, [isOpen, maxAmount, reset]);

  const onFormSubmit = (data: { amount: number; reason: string; note: string }) => {
    onSubmit({
      amount: Number(data.amount),
      reason: data.reason,
      note: data.note || undefined,
    });
  };

  const handleApplyFull = () => {
    setValue('amount', maxAmount);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply Credit Note</DialogTitle>
          <DialogDescription>
            Issue a Credit Note to reduce the outstanding balance of this invoice. Maksimal: <span className="font-bold text-foreground">{formatCurrency(maxAmount)}</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="amount">Credit Note Amount (IDR)</Label>
              <Button type="button" variant="link" className="h-auto p-0 text-xs text-amber-600 hover:text-amber-500" onClick={handleApplyFull}>
                Apply Max
              </Button>
            </div>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0"
              {...register('amount', {
                required: 'Credit note amount is required',
                min: { value: 0.01, message: 'Amount must be greater than 0' },
                max: { value: maxAmount, message: `Amount cannot exceed outstanding balance (${formatCurrency(maxAmount)})` },
              })}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason / Deskripsi Alasan</Label>
            <Input
              id="reason"
              placeholder="e.g. Return of 5 units of defective item, Discount adjust, etc."
              {...register('reason', { required: 'Reason is required' })}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Additional internal notes..."
              {...register('note')}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white" disabled={isPending}>
              {isPending ? 'Applying...' : 'Apply Credit Note'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
