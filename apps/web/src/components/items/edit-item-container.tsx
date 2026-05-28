"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useItem, useUpdateItem } from "./use-items";
import { ItemForm, ItemFormValues } from "./item-form";
import { Card, CardContent } from "@web/components/ui/card";
import { Skeleton } from "@web/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@web/components/ui/alert";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";
import { AlertCircleIcon } from "lucide-react";

interface EditItemContainerProps {
  id: string;
}

export function EditItemContainer({ id }: EditItemContainerProps) {
  const router = useRouter();
  const { data: item, isLoading, isError, error } = useItem(id);
  const updateMutation = useUpdateItem(id);

  const handleSubmit = async (data: ItemFormValues) => {
    try {
      await updateMutation.mutateAsync({
        code: data.code,
        name: data.name,
        unit: data.unit,
        categoryId: data.categoryId || null,
        minStock: data.minStock,
      });
      toast.success("Item updated successfully");
      router.push("/inventory/items");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update item");
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !item) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading item</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Could not fetch item details."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <ItemForm
          initialData={item}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
