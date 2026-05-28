"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWarehouse, useDeleteWarehouse } from "./use-warehouses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@web/components/ui/card";
import { Button } from "@web/components/ui/button";
import { Badge } from "@web/components/ui/badge";
import { Skeleton } from "@web/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@web/components/ui/alert";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";
import {
  Warehouse as WarehouseIcon,
  MapPinIcon,
  CalendarIcon,
  EditIcon,
  Trash2Icon,
  AlertCircleIcon,
  Loader2Icon,
  ClockIcon,
} from "lucide-react";

interface WarehouseDetailContainerProps {
  id: string;
}

export function WarehouseDetailContainer({ id }: WarehouseDetailContainerProps) {
  const router = useRouter();
  const { data: warehouse, isLoading, isError, error } = useWarehouse(id);
  const deleteMutation = useDeleteWarehouse();

  const handleEdit = () => {
    router.push(`/inventory/warehouses/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!warehouse) return;
    if (confirm(`Are you sure you want to delete warehouse ${warehouse.name}?`)) {
      try {
        await toast.promise(deleteMutation.mutateAsync(warehouse.id), {
          loading: `Deleting warehouse ${warehouse.name}...`,
          success: `Warehouse ${warehouse.name} deleted successfully`,
          error: "Failed to delete warehouse",
        });
        router.push("/inventory/warehouses");
      } catch (err) {
        const apiError = err as ApiError;
        toast.error(apiError.message || "Failed to delete warehouse");
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 pt-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
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
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/30 pb-6 border-b">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex justify-center items-center bg-primary/10 rounded-full w-16 h-16 text-primary border">
              <WarehouseIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">{warehouse.name}</CardTitle>
              <CardDescription className="flex items-center gap-1.5 text-sm">
                <MapPinIcon className="w-3.5 h-3.5" />
                {warehouse.address || "No address provided"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit} className="h-9">
              <EditIcon className="mr-1.5 w-4 h-4" />
              Edit Warehouse
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="h-9"
            >
              {deleteMutation.isPending ? (
                <Loader2Icon className="mr-1.5 w-4 h-4 animate-spin" />
              ) : (
                <Trash2Icon className="mr-1.5 w-4 h-4" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Section 1: Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Settings & Location</h3>
              <p className="text-xs text-muted-foreground">General warehouse settings and accessibility status.</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </span>
                <Badge variant={warehouse.isActive ? "default" : "destructive"}>
                  {warehouse.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              <div className="flex flex-col py-2 border-b gap-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Address
                </span>
                <span className="text-sm text-foreground">
                  {warehouse.address || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Audit Dates */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Timeline & Logs</h3>
              <p className="text-xs text-muted-foreground">Warehouse timestamps for creation and history.</p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Created At
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(warehouse.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Updated
                </span>
                <span className="text-sm flex items-center gap-1.5 text-foreground">
                  <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  {new Date(warehouse.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
