'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateDeliveryNote } from '@web/hooks/use-delivery-notes';
import { useSalesOrders, useSalesOrder } from '@web/hooks/use-sales-orders';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Separator } from '@web/components/ui/separator';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { Loader2Icon, TruckIcon, FileTextIcon, CalendarIcon, ChevronLeftIcon } from 'lucide-react';
import { Combobox } from '@web/components/ui/combobox';

const dnLineSchema = z.object({
  soLineItemId: z.string().min(1),
  itemId: z.string().min(1),
  itemName: z.string(),
  itemCode: z.string(),
  qtyOrdered: z.number(),
  qtyDeliveredBefore: z.number(),
  qty: z.number().int().min(0, 'Quantity cannot be negative'),
});

const formSchema = z.object({
  salesOrderId: z.string().min(1, 'Sales Order is required'),
  note: z.string().optional(),
  deliveryDate: z.string().optional(),
  lineItems: z.array(dnLineSchema).min(1, 'At least one item is required'),
});

type DNFormValues = z.infer<typeof formSchema>;

export function CreateDeliveryNoteContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const soIdFromUrl = searchParams.get('soId') || '';

  const [selectedSoId, setSelectedSoId] = React.useState(soIdFromUrl);

  const { data: sosData } = useSalesOrders({ limit: 100 });
  const pendingSos = React.useMemo(() => {
    return sosData?.data.filter(so => so.status === 'CONFIRMED' || so.status === 'PARTIAL') || [];
  }, [sosData]);

  const soOptions = React.useMemo(() => {
    return pendingSos.map((so) => ({
      value: so.id,
      label: `${so.number} (${so.customer?.name || 'No Customer'})`,
      searchKeywords: `${so.number} ${so.customer?.name || ''}`,
    }));
  }, [pendingSos]);

  const { data: soDetails, isLoading: isLoadingSo } = useSalesOrder(selectedSoId);
  const createMutation = useCreateDeliveryNote();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<DNFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      salesOrderId: selectedSoId,
      note: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      lineItems: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Saat SO dipilih, populate line items yang belum terkirim (qty - qtyDelivered > 0)
  React.useEffect(() => {
    if (soDetails) {
      setValue('salesOrderId', soDetails.id);
      const eligibleItems = soDetails.lineItems
        ?.filter((li) => li.qty - li.qtyDelivered > 0)
        ?.map((li) => ({
          soLineItemId: li.id,
          itemId: li.itemId,
          itemName: li.item?.name || 'Unknown Item',
          itemCode: li.item?.code || '',
          qtyOrdered: li.qty,
          qtyDeliveredBefore: li.qtyDelivered,
          qty: li.qty - li.qtyDelivered, // default sisa qty
        })) || [];
      replace(eligibleItems);
    } else {
      replace([]);
    }
  }, [soDetails, setValue, replace]);

  const handleSoChange = (id: string | null) => {
    setSelectedSoId(id || '');
  };

  const onSubmit = async (data: DNFormValues) => {
    const totalQty = data.lineItems.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty === 0) {
      toast.error('Total items to deliver must be greater than zero');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        salesOrderId: data.salesOrderId,
        note: data.note || undefined,
        deliveryDate: data.deliveryDate || undefined,
        lineItems: data.lineItems
          .filter(item => item.qty > 0)
          .map(item => ({
            soLineItemId: item.soLineItemId,
            itemId: item.itemId,
            qty: item.qty,
          })),
      });
      toast.success('Delivery Note created successfully');
      router.push(`/sales/delivery-notes/${result.id}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create Delivery Note';
      toast.error(errorMsg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (selectedSoId) {
              router.push(`/sales/sales-orders/${selectedSoId}`);
            } else {
              router.push('/sales/sales-orders');
            }
          }}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">Deliver Goods (Delivery Note)</h2>
          <p className="text-xs text-muted-foreground">Create a delivery note document based on a Sales Order.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">General Information</h3>
                <p className="text-xs text-muted-foreground">Select destination Sales Order, delivery date, and optional notes.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="salesOrderId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Sales Order
                  </Label>
                  <Controller
                    name="salesOrderId"
                    control={control}
                    render={({ field }) => (
                      <div className="relative w-full">
                        <FileTextIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                        <Combobox
                          value={field.value}
                          onChange={(val) => {
                            field.onChange(val);
                            handleSoChange(val);
                          }}
                          options={soOptions}
                          placeholder="Select SO"
                          searchPlaceholder="Search SO..."
                          emptyMessage="No confirmed Sales Orders found"
                          triggerClassName="pl-9"
                        />
                      </div>
                    )}
                  />
                  {errors.salesOrderId && <p className="text-xs text-destructive">{errors.salesOrderId.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="deliveryDate" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Delivery Date
                  </Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="deliveryDate"
                      type="date"
                      className="pl-9 h-9"
                      {...register('deliveryDate')}
                    />
                  </div>
                  {errors.deliveryDate && <p className="text-xs text-destructive">{errors.deliveryDate.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="note" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Notes
                  </Label>
                  <Input
                    id="note"
                    placeholder="e.g. Courier, vehicle number..."
                    className="h-9"
                    {...register('note')}
                  />
                </div>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Line Items */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Items to Deliver</h3>
                <p className="text-xs text-muted-foreground">Enter the physical quantity of goods ready to be shipped.</p>
              </div>

              {isLoadingSo ? (
                <Skeleton className="w-full h-40" />
              ) : selectedSoId && fields.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                  All items in this Sales Order have been fully delivered.
                </div>
              ) : !selectedSoId ? (
                <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                  Please select a Sales Order first to load the items list.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                        <th className="p-3 w-1/3">Item</th>
                        <th className="p-3 text-right">Order Qty</th>
                        <th className="p-3 text-right">Already Delivered</th>
                        <th className="p-3 text-right">Remaining</th>
                        <th className="p-3 w-32 text-right">Qty to Deliver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {fields.map((field, index) => {
                        const remaining = field.qtyOrdered - field.qtyDeliveredBefore;
                        return (
                          <tr key={field.id}>
                            <td className="p-3">
                              <div className="font-semibold">{field.itemName}</div>
                              <div className="text-xs text-muted-foreground font-mono">{field.itemCode}</div>
                            </td>
                            <td className="p-3 text-right font-medium">{field.qtyOrdered}</td>
                            <td className="p-3 text-right text-muted-foreground">{field.qtyDeliveredBefore}</td>
                            <td className="p-3 text-right text-primary font-semibold">{remaining}</td>
                            <td className="p-2 text-right">
                              <Input
                                type="number"
                                min="0"
                                max={remaining}
                                className="h-9 text-right"
                                {...register(`lineItems.${index}.qty`, {
                                  valueAsNumber: true,
                                  validate: (val) => val <= remaining || `Max is ${remaining}`,
                                })}
                              />
                              {errors.lineItems?.[index]?.qty && (
                                <p className="text-[10px] text-destructive mt-1 text-right">{errors.lineItems[index].qty.message}</p>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={createMutation.isPending || !selectedSoId || fields.length === 0} className="w-full sm:w-48 h-9 font-semibold">
                {createMutation.isPending ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Create Delivery Note
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
