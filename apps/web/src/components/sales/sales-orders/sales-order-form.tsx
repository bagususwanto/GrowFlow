'use client';

import React from 'react';
import { useForm, useFieldArray, Controller, useWatch, Control, UseFormRegister, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SalesOrder } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import { Separator } from '@web/components/ui/separator';
import { usePartners } from '@web/components/partners/use-partners';
import { useItems } from '@web/components/items/use-items';
import { useWarehouses } from '@web/components/warehouses/use-warehouses';
import { Loader2Icon, ShoppingCartIcon, PlusIcon, Trash2Icon, FileTextIcon, UserIcon, CalendarIcon, WarehouseIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import { Combobox } from '@web/components/ui/combobox';
import { PriceLoaderSales } from './price-loader-sales';

const lineItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  qty: z.number().int().positive('Quantity must be a positive integer'),
  unitPrice: z.number().positive('Unit price must be a positive number'),
});

const formSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  warehouseId: z.string().min(1, 'Warehouse is required'),
  note: z.string().optional(),
  orderDate: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one item is required'),
});

export type SalesOrderFormValues = z.infer<typeof formSchema>;

interface LineItemRowProps {
  control: Control<SalesOrderFormValues>;
  index: number;
  field: { id: string };
  register: UseFormRegister<SalesOrderFormValues>;
  errors: FieldErrors<SalesOrderFormValues>;
  remove: (index: number) => void;
  fieldsLength: number;
  itemOptions: Array<{ value: string; label: string; searchKeywords: string }>;
  priceReferences: Record<string, string>;
  setPriceReferences: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setValue: UseFormSetValue<SalesOrderFormValues>;
  onItemSearchChange: (search: string) => void;
}

function LineItemRow({
  control,
  index,
  field,
  register,
  errors,
  remove,
  fieldsLength,
  itemOptions,
  priceReferences,
  setPriceReferences,
  setValue,
  onItemSearchChange,
}: LineItemRowProps) {
  const qty = useWatch({
    control,
    name: `lineItems.${index}.qty`,
  }) || 0;

  const unitPrice = useWatch({
    control,
    name: `lineItems.${index}.unitPrice`,
  }) || 0;

  const subtotal = qty * unitPrice;

  return (
    <tr>
      <td className="p-2 align-top">
        <Controller
          name={`lineItems.${index}.itemId`}
          control={control}
          render={({ field: { value: selectVal, onChange: selectOnChange } }) => (
            <>
              <Combobox
                value={selectVal}
                onChange={(val) => {
                  selectOnChange(val);
                  setPriceReferences((prev) => {
                    const copy = { ...prev };
                    delete copy[field.id];
                    return copy;
                  });
                }}
                options={itemOptions}
                placeholder="Select item"
                searchPlaceholder="Search item..."
                emptyMessage="No items found"
                onSearchChange={onItemSearchChange}
              />
              {selectVal && (
                <PriceLoaderSales
                  itemId={selectVal}
                  onPriceLoaded={(price) => {
                    setValue(`lineItems.${index}.unitPrice`, price, { shouldValidate: true, shouldDirty: true });
                  }}
                  onReferenceMessage={(msg) => {
                    setPriceReferences((prev) => ({ ...prev, [field.id]: msg }));
                  }}
                />
              )}
            </>
          )}
        />
        {errors.lineItems?.[index]?.itemId && (
          <p className="text-[10px] text-destructive mt-1">{errors.lineItems[index].itemId.message}</p>
        )}
      </td>
      <td className="p-2 align-top">
        <Input
          type="number"
          min="1"
          className="h-9"
          {...register(`lineItems.${index}.qty`, { valueAsNumber: true })}
        />
        {errors.lineItems?.[index]?.qty && (
          <p className="text-[10px] text-destructive mt-1">{errors.lineItems[index].qty.message}</p>
        )}
      </td>
      <td className="p-2 align-top">
        <Input
          type="number"
          min="0"
          step="0.01"
          className="h-9"
          {...register(`lineItems.${index}.unitPrice`, { valueAsNumber: true })}
        />
        {priceReferences[field.id] && (
          <p className={`text-[10px] mt-1 font-medium ${priceReferences[field.id] === 'Belum ada histori harga' ? 'text-orange-500' : 'text-emerald-600'}`}>
            {priceReferences[field.id]}
          </p>
        )}
        {errors.lineItems?.[index]?.unitPrice && (
          <p className="text-[10px] text-destructive mt-1">{errors.lineItems[index].unitPrice.message}</p>
        )}
      </td>
      <td className="p-2 text-right font-medium align-middle">
        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(subtotal)}
      </td>
      <td className="p-2 text-center align-middle">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            remove(index);
            setPriceReferences((prev) => {
              const copy = { ...prev };
              delete copy[field.id];
              return copy;
            });
          }}
          disabled={fieldsLength === 1}
          className="h-8 w-8 text-destructive hover:bg-destructive/10"
        >
          <Trash2Icon className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  );
}

interface SalesOrderFormProps {
  initialData?: SalesOrder;
  onSubmit: (data: SalesOrderFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function SalesOrderForm({ initialData, onSubmit, isSubmitting }: SalesOrderFormProps) {
  const isEdit = !!initialData;

  const [customerSearch, setCustomerSearch] = React.useState('');
  const [itemSearch, setItemSearch] = React.useState('');

  const { data: customersData } = usePartners({ type: 'CUSTOMER', isActive: true, limit: 100, search: customerSearch });
  const { data: itemsData } = useItems({ status: 'active', limit: 100, search: itemSearch });
  const { data: warehousesData } = useWarehouses({ isActive: true, limit: 100 });

  const itemOptions = React.useMemo(() => {
    return itemsData?.data.map((item) => ({
      value: item.id,
      label: `${item.name} (${item.code})`,
      searchKeywords: `${item.name} ${item.code}`,
    })) || [];
  }, [itemsData]);

  const customerOptions = React.useMemo(() => {
    return customersData?.data.map((customer) => ({
      value: customer.id,
      label: `${customer.name} (${customer.code})`,
      searchKeywords: `${customer.name} ${customer.code}`,
    })) || [];
  }, [customersData]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<SalesOrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.customerId || '',
      warehouseId: initialData?.warehouseId || '',
      note: initialData?.note || '',
      orderDate: initialData?.orderDate ? initialData.orderDate.split('T')[0] : new Date().toISOString().split('T')[0],
      lineItems: initialData?.lineItems?.map((li) => ({
        itemId: li.itemId,
        qty: li.qty,
        unitPrice: li.unitPrice,
      })) || [{ itemId: '', qty: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems',
  });

  // Track price reference labels for each row
  const [priceReferences, setPriceReferences] = React.useState<Record<string, string>>({});

  const watchLineItems = useWatch({
    control,
    name: 'lineItems',
  });
  const totalAmount = React.useMemo(() => {
    return watchLineItems?.reduce((sum, item) => {
      const qty = Number(item?.qty) || 0;
      const price = Number(item?.unitPrice) || 0;
      return sum + (qty * price);
    }, 0) || 0;
  }, [watchLineItems]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Header Info */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">General Information</h3>
          <p className="text-xs text-muted-foreground">Select customer details, source warehouse, and transaction date.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="customerId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer
            </Label>
            <Controller
              name="customerId"
              control={control}
              render={({ field }) => (
                <div className="relative w-full">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" />
                  <Combobox
                    value={field.value}
                    onChange={field.onChange}
                    options={customerOptions}
                    placeholder="Select customer"
                    searchPlaceholder="Search customer..."
                    emptyMessage="No customers found"
                    triggerClassName="pl-9"
                    onSearchChange={setCustomerSearch}
                  />
                </div>
              )}
            />
            {errors.customerId && <p className="text-xs text-destructive">{errors.customerId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="warehouseId" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Source Warehouse
            </Label>
            <Controller
              name="warehouseId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full h-9 relative pl-9" id="warehouseId">
                    <WarehouseIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select warehouse">
                      {warehousesData?.data.find((w) => w.id === field.value)?.name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {warehousesData?.data.map((wh) => (
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

          <div className="space-y-1.5">
            <Label htmlFor="orderDate" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Order Date
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="orderDate"
                type="date"
                className="pl-9 h-9"
                {...register('orderDate')}
              />
            </div>
            {errors.orderDate && <p className="text-xs text-destructive">{errors.orderDate.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </Label>
            <div className="relative">
              <FileTextIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="note"
                placeholder="e.g. Terms, delivery notes..."
                className="pl-9 h-9"
                {...register('note')}
              />
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Items Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
            <p className="text-xs text-muted-foreground">List the items, ordered quantities and pricing.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ itemId: '', qty: 1, unitPrice: 0 })}
            className="h-8 text-xs font-semibold"
          >
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            Add Row
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-xs text-muted-foreground font-semibold uppercase text-left">
                <th className="p-3 w-1/2">Item</th>
                <th className="p-3 w-1/6">Qty</th>
                <th className="p-3 w-1/4">Unit Price</th>
                <th className="p-3 w-1/4 text-right">Subtotal</th>
                <th className="p-3 w-12 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {fields.map((field, index) => (
                <LineItemRow
                  key={field.id}
                  field={field}
                  index={index}
                  control={control}
                  register={register}
                  errors={errors}
                  remove={remove}
                  fieldsLength={fields.length}
                  itemOptions={itemOptions}
                  priceReferences={priceReferences}
                  setPriceReferences={setPriceReferences}
                  setValue={setValue}
                  onItemSearchChange={setItemSearch}
                />
              ))}
            </tbody>
          </table>
        </div>
        {errors.lineItems?.root && (
          <p className="text-xs text-destructive">{errors.lineItems.root.message}</p>
        )}
      </div>

      <Separator className="my-2" />

      {/* Totals Section */}
      <div className="flex flex-col items-end gap-3 pr-12">
        <div className="flex items-center gap-12 text-sm font-semibold">
          <span className="text-muted-foreground uppercase tracking-wider text-xs">Total Amount</span>
          <span className="text-lg text-foreground font-bold">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalAmount)}
          </span>
        </div>

        <div className="flex justify-end gap-3 w-full sm:w-auto">
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-10 px-6 font-semibold">
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-4 h-4 mr-2.5" />
                {isEdit ? 'Update Sales Order' : 'Create Sales Order'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
