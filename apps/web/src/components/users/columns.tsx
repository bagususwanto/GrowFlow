'use client';

import { ColumnDef } from '@tanstack/react-table';
import { UserResponse } from '@growflow/types';
import { Badge } from '@web/components/ui/badge';
import { Button } from '@web/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@web/components/ui/dropdown-menu';
import { EditIcon, EllipsisVerticalIcon, ShieldIcon, Trash2Icon, UserIcon } from 'lucide-react';

interface ColumnActions {
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

export const getColumns = ({ onEdit, onDelete }: ColumnActions): ColumnDef<UserResponse>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span>{user.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const roleName = row.original.role?.name || 'staff';
      const isSuperadmin = roleName === 'superadmin';

      return (
        <Badge
          variant={isSuperadmin ? 'default' : 'secondary'}
          className="flex items-center gap-1 w-fit capitalize"
        >
          <ShieldIcon className="w-3 h-3" />
          {roleName}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className="w-fit">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex data-[state=open]:bg-muted p-0 w-8 h-8 text-muted-foreground"
                size="icon"
              >
                <EllipsisVerticalIcon className="w-4 h-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <EditIcon className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(user)}>
                <Trash2Icon className="mr-2 w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
