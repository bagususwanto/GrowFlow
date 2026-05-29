'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Partner, PartnerType } from '@growflow/types';
import { Button } from '@web/components/ui/button';
import { Input } from '@web/components/ui/input';
import { Label } from '@web/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@web/components/ui/select';
import { Separator } from '@web/components/ui/separator';
import { Loader2Icon, UserIcon, MailIcon, PhoneIcon, MapPinIcon, CheckIcon, ShieldCheckIcon } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['SUPPLIER', 'CUSTOMER', 'BOTH'] as const, {
    required_error: 'Type is required',
  }),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PartnerFormValues = z.infer<typeof formSchema>;

interface PartnerFormProps {
  initialData?: Partner;
  onSubmit: (data: PartnerFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function PartnerForm({ initialData, onSubmit, isSubmitting }: PartnerFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PartnerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'SUPPLIER',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      address: initialData?.address || '',
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Section 1: Partner Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Partner Details</h3>
          <p className="text-xs text-muted-foreground">Specify the partner name and choose their business classification.</p>
        </div>

        {isEdit && (
          <div className="space-y-1.5 w-full sm:w-1/2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Partner Code</Label>
            <Input disabled value={initialData.code} className="h-9 font-mono" />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Partner Name
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" type="text" placeholder="e.g. Acme Corp" className="pl-9 h-9" {...register('name')} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Partner Type
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isEdit}>
                  <SelectTrigger className="w-full h-9 relative pl-9" id="type">
                    <ShieldCheckIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUPPLIER">Supplier</SelectItem>
                    <SelectItem value="CUSTOMER">Customer</SelectItem>
                    <SelectItem value="BOTH">Both (Supplier & Customer)</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
            {!isEdit && (
              <p className="text-[10px] text-muted-foreground">Code prefix will be: SUPPLIER (SUP-), CUSTOMER (CUS-), BOTH (PRT-)</p>
            )}
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Section 2: Contact & Address */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Contact & Location</h3>
          <p className="text-xs text-muted-foreground">Add business contact information and main delivery address.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="contact@partner.com" className="pl-9 h-9" {...register('email')} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phone Number
            </Label>
            <div className="relative">
              <PhoneIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="phone" type="text" placeholder="+62812345678" className="pl-9 h-9" {...register('phone')} />
            </div>
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Address
            </Label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <textarea
                id="address"
                placeholder="Street address, city, region..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                {...register('address')}
              />
            </div>
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>

          {isEdit && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="isActive" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Partner Status
              </Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? 'true' : 'false'}
                    onValueChange={(val) => field.onChange(val === 'true')}
                  >
                    <SelectTrigger className="w-full h-9 relative pl-9" id="isActive">
                      <CheckIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active (Visible in transactions)</SelectItem>
                      <SelectItem value="false">Inactive (Hidden/Suspended)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-40 h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? 'Update Partner' : 'Create Partner'
          )}
        </Button>
      </div>
    </form>
  );
}
