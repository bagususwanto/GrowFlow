"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RoleResponse } from "@growflow/types";
import { Button } from "@web/components/ui/button";
import { Input } from "@web/components/ui/input";
import { Label } from "@web/components/ui/label";
import { Badge } from "@web/components/ui/badge";
import { Separator } from "@web/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@web/components/ui/select";
import { Loader2Icon, ShieldIcon, CheckSquareIcon, XIcon, CheckIcon } from "lucide-react";
import { normalizePermissions } from "./columns";

const AVAILABLE_PERMISSIONS = [
  "read:items",
  "write:items",
  "read:partners",
  "write:partners",
  "read:stock",
  "write:stock",
  "read:users",
  "write:users",
  "read:warehouses",
  "write:warehouses",
  "read:roles",
  "write:roles",
];

const getFormSchema = () => {
  return z.object({
    name: z.string().min(1, "Role name is required"),
    permissions: z.array(z.string()).default([]),
    isActive: z.boolean().default(true),
  });
};

export type RoleFormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface RoleFormProps {
  initialData?: RoleResponse;
  onSubmit: (data: RoleFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function RoleForm({ initialData, onSubmit, isSubmitting }: RoleFormProps) {
  const isEdit = !!initialData;
  const formSchema = getFormSchema();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      permissions: normalizePermissions(initialData?.permissions),
      isActive: initialData?.isActive ?? true,
    },
  });

  const selectedPermissions = watch("permissions") || [];

  const handleTogglePermission = (permission: string, isSelected: boolean) => {
    if (isSelected) {
      setValue(
        "permissions",
        selectedPermissions.filter((p) => p !== permission),
        { shouldValidate: true }
      );
    } else {
      setValue("permissions", [...selectedPermissions, permission], {
        shouldValidate: true,
      });
    }
  };

  const handleRemovePermission = (permission: string) => {
    setValue(
      "permissions",
      selectedPermissions.filter((p) => p !== permission),
      { shouldValidate: true }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
      {/* Section 1: Role Details */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Role Details</h3>
          <p className="text-xs text-muted-foreground">Specify the role name and assign its permissions.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role Name
            </Label>
            <div className="relative">
              <ShieldIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="e.g. staff, manager"
                className="pl-9 h-9"
                {...register("name")}
              />
            </div>
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5 flex flex-col justify-end">
            <Label optional className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Assign Permissions
            </Label>
            <Controller
              name="permissions"
              control={control}
              render={() => (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="outline" className="h-9 w-full justify-between font-normal text-left">
                        <span>Select Permissions</span>
                        <CheckSquareIcon className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    }
                  />
                  <DropdownMenuContent className="w-56 max-h-[300px] overflow-y-auto">
                    <div className="px-2.5 py-1.5 text-xs font-semibold text-muted-foreground">
                      Available Permissions
                    </div>
                    <DropdownMenuSeparator />
                    {AVAILABLE_PERMISSIONS.map((permission) => {
                      const isSelected = selectedPermissions.includes(permission);
                      return (
                        <DropdownMenuCheckboxItem
                          key={permission}
                          checked={isSelected}
                          onCheckedChange={() => handleTogglePermission(permission, isSelected)}
                        >
                          {permission}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />
          </div>
        </div>
      </div>

      <Separator className="my-2" />

      {/* Section 2: Selected Permissions Display */}
      <div className="space-y-3">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Selected Permissions ({selectedPermissions.length})
          </h4>
        </div>
        
        {selectedPermissions.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/30 min-h-[50px] items-center">
            {selectedPermissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="flex items-center gap-1 py-1 pr-1 pl-2.5">
                <span className="font-mono text-xs">{permission}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 rounded-full hover:bg-muted"
                  onClick={() => handleRemovePermission(permission)}
                >
                  <XIcon className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed rounded-md p-4 text-muted-foreground text-xs min-h-[50px]">
            No permissions selected. This role will have no access.
          </div>
        )}
      </div>

      {isEdit && (
        <>
          <Separator className="my-2" />
          {/* Section 3: Status */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Status</h3>
              <p className="text-xs text-muted-foreground">Enable or disable this role for users.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="isActive" required className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Role Status
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
                        {field.value ? "Active (Available)" : "Inactive (Disabled)"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active (Available)</SelectItem>
                      <SelectItem value="false">Inactive (Disabled)</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.isActive && <p className="text-xs text-destructive">{errors.isActive.message}</p>}
            </div>
          </div>
        </>
      )}

      <div className="pt-2 flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-40 h-9">
          {isSubmitting ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            isEdit ? "Update Role" : "Create Role"
          )}
        </Button>
      </div>
    </form>
  );
}
