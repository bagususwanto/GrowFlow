"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CategoryItem } from "@growflow/types";
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
import { Loader2Icon, LayersIcon, FileTextIcon, CheckIcon } from "lucide-react";

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be at most 50 characters"),
  description: z.string().max(200, "Description must be at most 200 characters").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryItemFormProps {
  initialData?: CategoryItem;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel?: () => void;
}

export function CategoryItemForm({ initialData, onSubmit, isSubmitting, onCancel }: CategoryItemFormProps) {
  const isEdit = !!initialData;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      <div className="space-y-1.5">
        <Label htmlFor="name" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Category Name
        </Label>
        <div className="relative">
          <LayersIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="name" type="text" placeholder="e.g. Fertilizers" className="pl-9 h-9" {...register("name")} />
        </div>
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description" optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Description
        </Label>
        <div className="relative">
          <FileTextIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input id="description" type="text" placeholder="e.g. Plant nutrients and chemicals" className="pl-9 h-9" {...register("description")} />
        </div>
        {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
      </div>

      {isEdit && (
        <>
          <Separator className="my-2" />
          <div className="space-y-1.5">
            <Label htmlFor="isActive" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category Status
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
                      {field.value ? "Active" : "Inactive"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </>
      )}

      <div className="pt-2 flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-9">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? "Update Category" : "Create Category"
          )}
        </Button>
      </div>
    </form>
  );
}
