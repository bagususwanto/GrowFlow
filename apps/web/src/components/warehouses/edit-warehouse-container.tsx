"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWarehouse, useUpdateWarehouse } from "./use-warehouses";
import { WarehouseForm, WarehouseFormValues } from "./warehouse-form";
import { Card, CardContent } from "@web/components/ui/card";
import { Skeleton } from "@web/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@web/components/ui/alert";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";
import { AlertCircleIcon } from "lucide-react";

interface EditWarehouseContainerProps {
  id: string;
}

export function EditWarehouseContainer({ id }: EditWarehouseContainerProps) {
  const router = useRouter();
  const { data: warehouse, isLoading, isError, error } = useWarehouse(id);
  const updateMutation = useUpdateWarehouse(id);

  const handleSubmit = async (data: WarehouseFormValues) => {
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        address: data.address || undefined,
        isActive: data.isActive,
      });
      toast.success("Warehouse updated successfully");
      router.push("/inventory/warehouses");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update warehouse");
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

  if (isError || !warehouse) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading warehouse</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Could not fetch warehouse details."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <WarehouseForm
          initialData={warehouse}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
