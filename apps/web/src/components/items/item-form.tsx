"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Item } from "@growflow/types";
import { useCategoryItems } from "../category-items/use-category-items";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import { Separator } from "@web/components/ui/separator";
import { Loader2Icon, PackageIcon, FileTextIcon, LayersIcon, ScaleIcon, InboxIcon } from "lucide-react";

const itemFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code must be at most 50 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name must be at most 100 characters"),
  unit: z.string().min(1, "Unit is required").max(20, "Unit must be at most 20 characters"),
  categoryId: z.string().nullable().optional().or(z.literal("")),
  minStock: z.coerce.number().min(0, "Minimum stock must be at least 0"),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  initialData?: Item;
  onSubmit: (data: ItemFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function ItemForm({ initialData, onSubmit, isSubmitting }: ItemFormProps) {
  const isEdit = !!initialData;
  const { data: categoriesData, isLoading: isLoadingCategories } = useCategoryItems({ limit: 100 });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      code: initialData?.code || "",
      name: initialData?.name || "",
      unit: initialData?.unit || "",
      categoryId: initialData?.categoryId || "",
      minStock: initialData?.minStock ?? 0,
    },
  });

  const categories = categoriesData?.data || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
          <p className="text-xs text-muted-foreground">Specify the item&apos;s code, name, and category details.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="code" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item Code
            </Label>
            <div className="relative">
              <PackageIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="code"
                type="text"
                placeholder="e.g. ITEM-001"
                className="pl-9 h-9 font-mono"
                disabled={isEdit} // Disable editing item code
                {...register("code")}
              />
            </div>
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Item Name
            </Label>
            <div className="relative">
              <FileTextIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" type="text" placeholder="e.g. Premium Fertilizer" className="pl-9 h-9" {...register("name")} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Section 2: Details & Inventory */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Inventory & Classification</h3>
          <p className="text-xs text-muted-foreground">Define item unit, category group, and safety stock level.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="categoryId" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </Label>
            {isLoadingCategories ? (
              <Input disabled placeholder="Loading categories..." className="h-9" />
            ) : (
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value || "none"} onValueChange={(val) => field.onChange(val === "none" ? null : val)}>
                    <SelectTrigger className="w-full h-9 relative pl-9" id="categoryId">
                      <LayersIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select a category">
                        {categories.find((cat) => cat.id === field.value)?.name || "No Category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.categoryId && <p className="text-xs text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="unit" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Unit of Measure
            </Label>
            <div className="relative">
              <ScaleIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="unit" type="text" placeholder="e.g. pcs, kg, box" className="pl-9 h-9" {...register("unit")} />
            </div>
            {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="minStock" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Minimum Stock (Safety Stock)
            </Label>
            <div className="relative">
              <InboxIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="minStock" type="number" placeholder="0" className="pl-9 h-9" {...register("minStock")} />
            </div>
            {errors.minStock && <p className="text-xs text-destructive">{errors.minStock.message}</p>}
          </div>
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
            isEdit ? "Update Item" : "Create Item"
          )}
        </Button>
      </div>
    </form>
  );
}
