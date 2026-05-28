"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Warehouse } from "@growflow/types";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Textarea } from "@web/components/ui/textarea";
import { Separator } from "@web/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import { Loader2Icon, WarehouseIcon, MapPinIcon, CheckIcon } from "lucide-react";

const getFormSchema = () => {
  return z.object({
    name: z.string().min(1, "Warehouse name is required"),
    address: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
  });
};

export type WarehouseFormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface WarehouseFormProps {
  initialData?: Warehouse;
  onSubmit: (data: WarehouseFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function WarehouseForm({ initialData, onSubmit, isSubmitting }: WarehouseFormProps) {
  const isEdit = !!initialData;
  const formSchema = getFormSchema();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<WarehouseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      address: initialData?.address || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Section 1: Warehouse Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Warehouse Details</h3>
          <p className="text-xs text-muted-foreground">Specify the name and physical address of the warehouse.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Warehouse Name
            </Label>
            <div className="relative">
              <WarehouseIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" type="text" placeholder="Main Warehouse" className="pl-9 h-9" {...register("name")} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Physical Address
            </Label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                placeholder="123 Industry Road, Sector 4..."
                className="pl-9 min-h-[80px]"
                {...register("address")}
              />
            </div>
            {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
          </div>
        </div>
      </div>

      {isEdit && (
        <>
          <Separator className="my-2" />
          {/* Section 2: Warehouse Status */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Status</h3>
              <p className="text-xs text-muted-foreground">Enable or disable this warehouse for inventory transactions.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isActive" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Warehouse Status
              </Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? "true" : "false"}
                    onValueChange={(val) => field.onChange(val === "true")}
                  >
                    <SelectTrigger className="w-full h-9 relative pl-9" id="isActive">
                      <CheckIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select status">
                        {field.value ? "Active (Available for transactions)" : "Inactive (Disabled)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active (Available for transactions)</SelectItem>
                      <SelectItem value="false">Inactive (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.isActive && <p className="text-xs text-destructive">{errors.isActive.message}</p>}
            </div>
          </div>
        </>
      )}

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-40 h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? "Update Warehouse" : "Create Warehouse"
          )}
        </Button>
      </div>
    </form>
  );
}
