'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateGoodsReceipt } from '@web/hooks/use-goods-receipts';
import { usePurchaseOrders, usePurchaseOrder } from '@web/hooks/use-purchase-orders';
import { useWarehouses } from '@web/components/warehouses/use-warehouses';
import { Card, CardContent } from '@web/components/ui/card';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Separator } from '@web/components/ui/separator';
import { Skeleton } from '@web/components/ui/skeleton';
import { toast } from 'sonner';
import { ApiError } from '@growflow/types';
import { Loader2Icon, ShoppingBagIcon, WarehouseIcon, FileTextIcon, CalendarIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';

const grLineSchema = z.object({
  poLineItemId: z.string().min(1),
  itemId: z.string().min(1),
  itemName: z.string(),
  itemCode: z.string(),
  qtyOrdered: z.number(),
  qtyReceivedBefore: z.number(),
  qty: z.number().int().min(0, 'Quantity cannot be negative'),
});

const formSchema = z.object({
  purchaseOrderId: z.string().min(1, 'Purchase Order is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  note: z.string().optional(),
  receivedDate: z.string().optional(),
  lineItems: z.array(grLineSchema).min(1, 'At least one item is required'),
});

type GRFormValues = z.infer<typeof formSchema>;

export function CreateGoodsReceiptContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const poIdFromUrl = searchParams.get('poId') || '';

  const [selectedPoId, setSelectedPoId] = React.useState(poIdFromUrl);

  const { data: posData } = usePurchaseOrders({ limit: 100 });
  const pendingPos = React.useMemo(() => {
    return posData?.data.filter(po => po.status === 'APPROVED' || po.status === 'PARTIAL') || [];
  }, [posData]);

  const { data: warehousesData } = useWarehouses({ limit: 100 });
  const activeWarehouses = React.useMemo(() => {
    return warehousesData?.data.filter(w => w.isActive) || [];
  }, [warehousesData]);

  const { data: poDetails, isLoading: isLoadingPo } = usePurchaseOrder(selectedPoId);
  const createMutation = useCreateGoodsReceipt();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<GRFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchaseOrderId: selectedPoId,
      warehouseId: '',
      note: '',
      receivedDate: new Date().toISOString().split('T')[0],
      lineItems: [],
    },
  });

  const { fields, replace } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Saat PO dipilih, populate line items yang masih bisa diterima (qty > qtyReceived)
  React.useEffect(() => {
    if (poDetails) {
      setValue('purchaseOrderId', poDetails.id);
      const eligibleItems = poDetails.lineItems
        ?.filter((li) => li.qty - li.qtyReceived > 0)
        ?.map((li) => ({
          poLineItemId: li.id,
          itemId: li.itemId,
          itemName: li.item?.name || 'Unknown Item',
          itemCode: li.item?.code || '',
          qtyOrdered: li.qty,
          qtyReceivedBefore: li.qtyReceived,
          qty: li.qty - li.qtyReceived, // default ke sisa qty
        })) || [];
      replace(eligibleItems);
    } else {
      replace([]);
    }
  }, [poDetails, setValue, replace]);

  const handlePoChange = (id: string | null) => {
    setSelectedPoId(id || '');
  };

  const onSubmit = async (data: GRFormValues) => {
    // Validasi input qty (total qty diterima tidak boleh 0 untuk semua baris)
    const totalQty = data.lineItems.reduce((sum, item) => sum + item.qty, 0);
    if (totalQty === 0) {
      toast.error('Total receive quantity must be greater than zero');
      return;
    }

    try {
      await createMutation.mutateAsync({
        purchaseOrderId: data.purchaseOrderId,
        warehouseId: data.warehouseId,
        note: data.note || undefined,
        receivedDate: data.receivedDate || undefined,
        lineItems: data.lineItems
          .filter(item => item.qty > 0) // kirim yang qty-nya > 0 saja
          .map(item => ({
            poLineItemId: item.poLineItemId,
            itemId: item.itemId,
            qty: item.qty,
          })),
      });
      toast.success('Goods Receipt created successfully as DRAFT');
      router.push('/purchasing/goods-receipts');
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Failed to create Goods Receipt');
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground font-semibold">General Information</h3>
              <p className="text-xs text-muted-foreground">Select the PO and target Warehouse for this delivery receipt.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="purchaseOrderId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Purchase Order
                </Label>
                <Select value={selectedPoId} onValueChange={handlePoChange}>
                  <SelectTrigger className="w-full h-9 relative pl-9" id="purchaseOrderId">
                    <FileTextIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select PO" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingPos.map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.number} ({po.supplier?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.purchaseOrderId && <p className="text-xs text-destructive">{errors.purchaseOrderId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="warehouseId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Target Warehouse
                </Label>
                <Controller
                  name="warehouseId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-9 relative pl-9" id="warehouseId">
                        <WarehouseIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeWarehouses.map((w) => (
                          <SelectItem key={w.id} value={w.id}>
                            {w.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.warehouseId && <p className="text-xs text-destructive">{errors.warehouseId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receivedDate" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Received Date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="receivedDate"
                    type="date"
                    className="pl-9 h-9"
                    {...register('receivedDate')}
                  />
                </div>
                {errors.receivedDate && <p className="text-xs text-destructive">{errors.receivedDate.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="note" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </Label>
                <Input
                  id="note"
                  placeholder="e.g. Delivery courier, vehicle..."
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
              <h3 className="text-sm font-semibold text-foreground">Items to Receive</h3>
              <p className="text-xs text-muted-foreground">Input the physical quantity received for each order line.</p>
            </div>

            {isLoadingPo ? (
              <Skeleton className="w-full h-40" />
            ) : selectedPoId && fields.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                All items on this PO have already been received.
              </div>
            ) : !selectedPoId ? (
              <div className="p-8 text-center text-muted-foreground border rounded-lg bg-muted/20">
                Please select a Purchase Order first to populate items.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                      <th className="p-3 w-1/3">Item</th>
                      <th className="p-3 text-right">Order Qty</th>
                      <th className="p-3 text-right">Already Received</th>
                      <th className="p-3 text-right">Remaining</th>
                      <th className="p-3 w-32 text-right">Qty to Receive</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {fields.map((field, index) => {
                      const remaining = field.qtyOrdered - field.qtyReceivedBefore;
                      return (
                        <tr key={field.id}>
                          <td className="p-3">
                            <div className="font-semibold">{field.itemName}</div>
                            <div className="text-xs text-muted-foreground font-mono">{field.itemCode}</div>
                          </td>
                          <td className="p-3 text-right font-medium">{field.qtyOrdered}</td>
                          <td className="p-3 text-right text-muted-foreground">{field.qtyReceivedBefore}</td>
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
            <Button type="submit" disabled={createMutation.isPending || !selectedPoId || fields.length === 0} className="w-full sm:w-48 h-9 font-semibold">
              {createMutation.isPending ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Create Goods Receipt
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
