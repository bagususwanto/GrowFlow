"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateWarehouse } from "./use-warehouses";
import { WarehouseForm, WarehouseFormValues } from "./warehouse-form";
import { Card, CardContent } from "@web/components/ui/card";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";

export function CreateWarehouseContainer() {
  const router = useRouter();
  const createMutation = useCreateWarehouse();

  const handleSubmit = async (data: WarehouseFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        address: data.address || undefined,
      });
      toast.success("Warehouse created successfully");
      router.push("/inventory/warehouses");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to create warehouse");
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <WarehouseForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
