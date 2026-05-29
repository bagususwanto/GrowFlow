"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAuthStore } from "@web/stores/auth.store";
import { useUpdateProfile } from "./use-profile";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@web/components/ui/card";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Loader2Icon, UserIcon, MailIcon, ShieldIcon } from "lucide-react";
import { ApiError } from "@growflow/types";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function GeneralTab() {
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfile();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Sync state if user changes/loads later
  useEffect(() => {
    if (user?.name) {
      setValue("name", user.name);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfileMutation.mutateAsync(data);
      toast.success("Profile updated successfully");
    } catch (err) {
      const apiError = err as ApiError;
      toast.error(apiError.message || "Failed to update profile");
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">General Information</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          View and update your general account profile details.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" type="text" placeholder="John Doe" className="pl-9 h-9" {...register("name")} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address (Read-only)
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  className="pl-9 h-9 bg-muted/50 cursor-not-allowed"
                  disabled
                  value={user?.email || ""}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                System Role (Read-only)
              </Label>
              <div className="relative">
                <ShieldIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="role"
                  type="text"
                  className="pl-9 h-9 bg-muted/50 cursor-not-allowed capitalize"
                  disabled
                  value={user?.role || ""}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-end border-t border-border mt-4">
          <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full sm:w-40 h-9">
            {updateProfileMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
