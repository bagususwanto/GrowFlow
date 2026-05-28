"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useRole, useUpdateRole } from "./use-roles";
import { RoleForm, RoleFormValues } from "./role-form";
import { Card, CardContent } from "@web/components/ui/card";
import { Skeleton } from "@web/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@web/components/ui/alert";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";
import { AlertCircleIcon } from "lucide-react";

interface EditRoleContainerProps {
  id: string;
}

export function EditRoleContainer({ id }: EditRoleContainerProps) {
  const router = useRouter();
  const { data: role, isLoading, isError, error } = useRole(id);
  const updateMutation = useUpdateRole(id);

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      await updateMutation.mutateAsync({
        name: data.name,
        permissions: data.permissions,
      });
      toast.success("Role updated successfully");
      router.push("/administration/roles");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update role");
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

  if (isError || !role) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading role</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Could not fetch role details."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <RoleForm
          initialData={role}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
