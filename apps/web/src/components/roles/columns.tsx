'use client';

import { ColumnDef } from '@tanstack/react-table';
import { RoleResponse } from '@growflow/types';
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
import { EditIcon, EllipsisVerticalIcon, ShieldIcon, Trash2Icon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon } from 'lucide-react';

interface ColumnActions {
  onView: (role: RoleResponse) => void;
  onEdit: (role: RoleResponse) => void;
  onDelete: (role: RoleResponse) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export function normalizePermissions(rawPermissions: unknown): string[] {
  if (!rawPermissions) return [];
  if (Array.isArray(rawPermissions)) return rawPermissions.map(String);
  if (typeof rawPermissions === 'string') {
    try {
      const parsed = JSON.parse(rawPermissions);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
      // Check if it's a double-encoded string
      if (typeof parsed === 'string') {
        const doubleParsed = JSON.parse(parsed);
        if (Array.isArray(doubleParsed)) {
          return doubleParsed.map(String);
        }
      }
      return [rawPermissions];
    } catch {
      // If it's a comma-separated list or plain string
      if (rawPermissions.startsWith('[') && rawPermissions.endsWith(']')) {
        try {
          // Attempt to evaluate or clean the string
          const cleaned = rawPermissions
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((s: string) => s.replace(/"/g, '').trim())
            .filter(Boolean);
          if (cleaned.length > 0) return cleaned;
        } catch {
          // Ignore parsing errors
        }
      }
      return [rawPermissions];
    }
  }
  return [];
}

export const getColumns = ({ onView, onEdit, onDelete, sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<RoleResponse>[] => [

  {
    accessorKey: 'name',
    header: () => {
      const isSorted = sortBy === 'name';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('name')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Role Name
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            )
          ) : (
            <ArrowUpDownIcon className="ml-2 w-3.5 h-3.5 text-muted-foreground/30" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <ShieldIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="capitalize">{role.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => {
      const permissions = normalizePermissions(row.original.permissions);
      if (permissions.length === 0) {
        return <span className="text-muted-foreground text-xs">No permissions</span>;
      }

      // Display the count and maybe a truncated list
      return (
        <div className="flex flex-wrap gap-1 max-w-[400px]">
          {permissions.slice(0, 3).map((perm: string) => (
            <Badge key={perm} variant="outline" className="text-[10px] px-1.5 py-0">
              {perm}
            </Badge>
          ))}
          {permissions.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{permissions.length - 3} more
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? 'default' : 'destructive'} className="w-fit font-medium">
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: () => {
      const isSorted = sortBy === 'createdAt';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('createdAt')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Created At
          {isSorted ? (
            sortOrder === 'asc' ? (
              <ArrowUpIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            ) : (
              <ArrowDownIcon className="ml-2 w-3.5 h-3.5 text-foreground" />
            )
          ) : (
            <ArrowUpDownIcon className="ml-2 w-3.5 h-3.5 text-muted-foreground/30" />
          )}
        </Button>
      );
    },
    cell: ({ row }) => {
      const role = row.original;
      return <span className="text-sm">{new Date(role.createdAt).toLocaleString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original;
      // Do not allow deleting system default critical roles if needed (e.g. superadmin)
      const isSystemRole = ['superadmin', 'manager', 'sales', 'purchasing', 'warehouse', 'finance'].includes(role.name.toLowerCase());

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
              <DropdownMenuItem onClick={() => onView(role)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(role)}>
                <EditIcon className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(role)}
                disabled={isSystemRole}
                title={isSystemRole ? "System roles cannot be deleted" : undefined}
              >
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
