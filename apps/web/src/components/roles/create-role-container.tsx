"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateRole } from "./use-roles";
import { RoleForm, RoleFormValues } from "./role-form";
import { Card, CardContent } from "@web/components/ui/card";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";

export function CreateRoleContainer() {
  const router = useRouter();
  const createMutation = useCreateRole();

  const handleSubmit = async (data: RoleFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        permissions: data.permissions,
      });
      toast.success("Role created successfully");
      router.push("/administration/roles");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to create role");
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <RoleForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
