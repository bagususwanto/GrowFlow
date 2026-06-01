"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCreateItem } from "./use-items";
import { ItemForm, ItemFormValues } from "./item-form";
import { Card, CardContent } from "@web/components/ui/card";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";

export function CreateItemContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPath = searchParams.get('from') || '/inventory/items';
  const createMutation = useCreateItem();

  const handleSubmit = async (data: ItemFormValues) => {
    try {
      await createMutation.mutateAsync({
        code: data.code,
        name: data.name,
        unit: data.unit,
        categoryId: data.categoryId || null,
        minStock: data.minStock,
      });
      toast.success("Item created successfully");
      router.push(fromPath);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to create item");
    }
  };

  const isProduct = fromPath.includes('/products');

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <ItemForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
          isProduct={isProduct}
        />
      </CardContent>
    </Card>
  );
}
