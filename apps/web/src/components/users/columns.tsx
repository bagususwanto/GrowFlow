"use client";

import { ColumnDef } from "@tanstack/react-table";
import { UserResponse } from "@growflow/types";
import { Badge } from "@web/components/ui/badge";
import { Button } from "@web/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, ShieldIcon, UserIcon } from "lucide-react";

interface ColumnActions {
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<UserResponse>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <span>{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const roleName = row.original.role?.name || "staff";
      const isSuperadmin = roleName === "superadmin";

      return (
        <Badge
          variant={isSuperadmin ? "default" : "secondary"}
          className="flex w-fit items-center gap-1 capitalize"
        >
          <ShieldIcon className="h-3 w-3" />
          {roleName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "destructive"} className="w-fit">
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex h-8 w-8 p-0 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <EllipsisVerticalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(user)}
              >
                Delete User
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
