"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserResponse } from "@growflow/types";
import { useRoles } from "./use-roles";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import { Separator } from "@web/components/ui/separator";
import { Loader2Icon, UserIcon, MailIcon, LockIcon, ShieldIcon, CheckIcon } from "lucide-react";

// Schema generators based on mode (create vs edit)
const getFormSchema = (isEdit: boolean) => {
  return z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: isEdit
      ? z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal(""))
      : z.string().min(6, "Password must be at least 6 characters"),
    roleId: z.string().min(1, "Role is required"),
    isActive: z.boolean().default(true),
  });
};

export type UserFormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface UserFormProps {
  initialData?: UserResponse;
  onSubmit: (data: UserFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function UserForm({ initialData, onSubmit, isSubmitting }: UserFormProps) {
  const isEdit = !!initialData;
  const formSchema = getFormSchema(isEdit);
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      roleId: initialData?.roleId || "",
      isActive: initialData?.isActive ?? true,
    },
  });

  const roles = rolesData?.data || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Section 1: Profile Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
          <p className="text-xs text-muted-foreground">Specify the user&apos;s personal details and contact email.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" type="text" placeholder="John Doe" className="pl-9 h-9" {...register("name")} />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" placeholder="john.doe@company.com" className="pl-9 h-9" {...register("email")} />
            </div>
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Section 2: Account Credentials & Access */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Account & Access Settings</h3>
          <p className="text-xs text-muted-foreground">Define system roles, access status, and secure password credentials.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Password {!isEdit ? <span className="text-destructive">*</span> : <span className="text-[10px] text-muted-foreground lowercase font-normal"> (optional - leave blank to keep current)</span>}
            </Label>
            <div className="relative">
              <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-9 h-9" {...register("password")} />
            </div>
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="roleId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              System Role <span className="text-destructive">*</span>
            </Label>
            {isLoadingRoles ? (
              <Input disabled placeholder="Loading roles..." className="h-9" />
            ) : (
              <Controller
                name="roleId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-9 relative pl-9" id="roleId">
                      <ShieldIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select a role">
                        {roles.find((role) => role.id === field.value)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
            {errors.roleId && <p className="text-xs text-destructive">{errors.roleId.message}</p>}
          </div>

          {isEdit && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="isActive" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Account Status <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ? "true" : "false"}
                    onValueChange={(val) => field.onChange(val === "true")}
                  >
                    <SelectTrigger className="w-full h-9 relative pl-9" id="isActive">
                      <CheckIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <SelectValue placeholder="Select status">
                        {field.value ? "Active (Allowed to sign in)" : "Inactive (Suspended)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active (Allowed to sign in)</SelectItem>
                      <SelectItem value="false">Inactive (Suspended)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.isActive && <p className="text-xs text-destructive">{errors.isActive.message}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-40 h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? "Update User" : "Create User"
          )}
        </Button>
      </div>
    </form>
  );
}
