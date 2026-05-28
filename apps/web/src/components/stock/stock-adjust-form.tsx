'use client';

import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Textarea } from '@web/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import { useItems } from '../items/use-items';
import { useWarehouses } from '../warehouses/use-warehouses';
import { Loader2Icon, PackageIcon, WarehouseIcon, ArrowUpRightIcon, FileTextIcon } from 'lucide-react';

const formSchema = z.object({
  itemId: z.string().min(1, 'Item selection is required'),
  warehouseId: z.string().min(1, 'Warehouse selection is required'),
  adjustmentType: z.enum(['INCREASE', 'DECREASE']),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  note: z.string().optional().or(z.literal('')),
});

export type StockAdjustFormValues = z.infer<typeof formSchema>;

interface StockAdjustFormProps {
  onSubmit: (data: { itemId: string; warehouseId: string; qty: number; note?: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function StockAdjustForm({ onSubmit, isSubmitting }: StockAdjustFormProps) {
  const { data: itemsData, isLoading: isLoadingItems } = useItems({ limit: 100 });
  const { data: warehousesData, isLoading: isLoadingWarehouses } = useWarehouses({ limit: 100 });

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: '',
      warehouseId: '',
      adjustmentType: 'INCREASE',
      qty: 1,
      note: '',
    },
  });

  const selectedItemId = watch('itemId');
  const selectedItem = React.useMemo(() => {
    return itemsData?.data?.find(item => item.id === selectedItemId);
  }, [itemsData, selectedItemId]);

  const handleFormSubmit = async (values: StockAdjustFormValues) => {
    // If DECREASE, qty is negative
    const finalQty = values.adjustmentType === 'DECREASE' ? -values.qty : values.qty;
    await onSubmit({
      itemId: values.itemId,
      warehouseId: values.warehouseId,
      qty: finalQty,
      note: values.note || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 w-full">
      <div className="space-y-4">
        {/* Item Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="itemId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Item
          </Label>
          <Controller
            name="itemId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoadingItems}
              >
                <SelectTrigger className="w-full h-9 relative pl-9" id="itemId">
                  <PackageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <SelectValue placeholder={isLoadingItems ? 'Loading items...' : 'Choose an item'} />
                </SelectTrigger>
                <SelectContent>
                  {itemsData?.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.itemId && <p className="text-xs text-destructive">{errors.itemId.message}</p>}
        </div>

        {/* Warehouse Selection */}
        <div className="space-y-1.5">
          <Label htmlFor="warehouseId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Select Warehouse
          </Label>
          <Controller
            name="warehouseId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isLoadingWarehouses}
              >
                <SelectTrigger className="w-full h-9 relative pl-9" id="warehouseId">
                  <WarehouseIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <SelectValue placeholder={isLoadingWarehouses ? 'Loading warehouses...' : 'Choose a warehouse'} />
                </SelectTrigger>
                <SelectContent>
                  {warehousesData?.data?.filter(w => w.isActive)?.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>
                      {wh.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.warehouseId && <p className="text-xs text-destructive">{errors.warehouseId.message}</p>}
        </div>

        {/* Grid for Adjustment Type and Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Adjustment Type */}
          <div className="space-y-1.5">
            <Label htmlFor="adjustmentType" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Adjustment Type
            </Label>
            <Controller
              name="adjustmentType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger className="w-full h-9 relative pl-9" id="adjustmentType">
                    <ArrowUpRightIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCREASE">Stock In (Increase)</SelectItem>
                    <SelectItem value="DECREASE">Stock Out (Decrease)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.adjustmentType && <p className="text-xs text-destructive">{errors.adjustmentType.message}</p>}
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label htmlFor="qty" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Quantity
            </Label>
            <div className="relative">
              <Input
                id="qty"
                type="number"
                min={1}
                placeholder="10"
                className="h-9 pr-12"
                {...register('qty', { valueAsNumber: true })}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                {selectedItem?.unit || 'units'}
              </span>
            </div>
            {errors.qty && <p className="text-xs text-destructive">{errors.qty.message}</p>}
          </div>
        </div>

        {/* Note */}
        <div className="space-y-1.5">
          <Label htmlFor="note" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Adjustment Note / Reason
          </Label>
          <div className="relative">
            <FileTextIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Textarea
              id="note"
              placeholder="E.g., Physical stock count correction, damaged item disposal..."
              className="pl-9 min-h-[80px]"
              {...register('note')}
            />
          </div>
          {errors.note && <p className="text-xs text-destructive">{errors.note.message}</p>}
        </div>
      </div>

      <div className="pt-2 flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-40 h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Adjustment'
          )}
        </Button>
      </div>
    </form>
  );
}
