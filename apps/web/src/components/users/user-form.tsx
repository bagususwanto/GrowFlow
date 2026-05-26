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
import { Loader2Icon } from "lucide-react";

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
      <div className="space-y-1.5">
        <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Full Name
        </Label>
        <Input id="name" type="text" placeholder="John Doe" {...register("name")} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Email Address
        </Label>
        <Input id="email" type="email" placeholder="john.doe@company.com" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Password {isEdit && <span className="text-[10px] text-muted-foreground lowercase font-normal">(leave blank to keep current)</span>}
        </Label>
        <Input id="password" type="password" placeholder="••••••••" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="roleId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Role
        </Label>
        {isLoadingRoles ? (
          <Input disabled placeholder="Loading roles..." />
        ) : (
          <Controller
            name="roleId"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full h-8" id="roleId">
                  <SelectValue placeholder="Select a role" />
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
        <div className="space-y-1.5">
          <Label htmlFor="isActive" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status
          </Label>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? "true" : "false"}
                onValueChange={(val) => field.onChange(val === "true")}
              >
                <SelectTrigger className="w-full h-8" id="isActive">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.isActive && <p className="text-xs text-destructive">{errors.isActive.message}</p>}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full h-9">
        {isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Saving User...
          </>
        ) : (
          isEdit ? "Update User" : "Create User"
        )}
      </Button>
    </form>
  );
}
