"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useUser, useUpdateUser } from "@web/hooks/use-users";
import { UserForm } from "./user-form";
import { Card, CardContent } from "@web/components/ui/card";
import { Skeleton } from "@web/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@web/components/ui/alert";
import { toast } from "sonner";
import { ApiError } from "@growflow/types";
import { AlertCircleIcon } from "lucide-react";

interface EditUserContainerProps {
  id: string;
}

export function EditUserContainer({ id }: EditUserContainerProps) {
  const router = useRouter();
  const { data: user, isLoading, isError, error } = useUser(id);
  const updateMutation = useUpdateUser(id);

  const handleSubmit = async (data: any) => {
    try {
      // Remove password from payload if it was left blank
      const payload = { ...data };
      if (!payload.password) {
        delete payload.password;
      }
      
      await updateMutation.mutateAsync(payload);
      toast.success("User updated successfully");
      router.push("/dashboard/users");
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || "Failed to update user");
    }
  };

  if (isLoading) {
    return (
      <Card className="max-w-md">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !user) {
    return (
      <Alert variant="destructive" className="max-w-md">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertTitle>Error loading user</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Could not fetch user details."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="max-w-md">
      <CardContent className="p-6">
        <UserForm
          initialData={user}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}
