"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCreateUser } from "@web/hooks/use-users";
import { UserForm } from "./user-form";
import { Card, CardContent } from "@web/components/ui/card";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";

export function CreateUserContainer() {
  const router = useRouter();
  const createMutation = useCreateUser();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success("User created successfully");
      router.push("/dashboard/users");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to create user");
    }
  };

  return (
    <Card className="max-w-md">
      <CardContent className="p-6">
        <UserForm
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
