"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUpdatePassword } from "./use-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@web/components/ui/card";
import { Button } from "@web/components/ui/button";
import { PasswordInput } from "@web/components/ui/password-input";
import { Label } from "@web/components/ui/label";
import { Loader2Icon, LockIcon } from "lucide-react";
import { ApiError } from "@growflow/types";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecurityTab() {
  const updatePasswordMutation = useUpdatePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    try {
      await updatePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password updated successfully");
      reset();
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Failed to update password");
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Security Settings</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Change your password to ensure your account security.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-4 w-full">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  id="currentPassword"
                  placeholder="••••••••"
                  className="pl-9 h-9"
                  {...register("currentPassword")}
                />
              </div>
              {errors.currentPassword && <p className="text-xs text-destructive">{errors.currentPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                New Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  id="newPassword"
                  placeholder="••••••••"
                  className="pl-9 h-9"
                  {...register("newPassword")}
                />
              </div>
              {errors.newPassword && <p className="text-xs text-destructive">{errors.newPassword.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <PasswordInput
                  id="confirmPassword"
                  placeholder="••••••••"
                  className="pl-9 h-9"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end border-t border-border mt-4">
          <Button type="submit" disabled={updatePasswordMutation.isPending} className="w-full sm:w-40 h-9">
            {updatePasswordMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Password"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
