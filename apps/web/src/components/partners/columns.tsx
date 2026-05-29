'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Partner } from '@growflow/types';
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
import { EditIcon, EllipsisVerticalIcon, UserIcon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, Trash2Icon, ContactIcon } from 'lucide-react';

interface ColumnActions {
  onView: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onDelete: (partner: Partner) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({ onView, onEdit, onDelete, sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<Partner>[] => [
  {
    accessorKey: 'code',
    header: () => {
      const isSorted = sortBy === 'code';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('code')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Code
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
      return <span className="font-mono text-xs font-semibold">{row.original.code}</span>;
    },
  },
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
          Name
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
      const partner = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span>{partner.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => {
      const type = row.original.type;
      let variant: 'default' | 'secondary' | 'outline' = 'outline';
      if (type === 'SUPPLIER') variant = 'secondary';
      else if (type === 'CUSTOMER') variant = 'default';

      return (
        <Badge variant={variant} className="capitalize font-medium">
          {type.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: 'contactInfo',
    header: 'Contact Info',
    cell: ({ row }) => {
      const partner = row.original;
      return (
        <div className="flex flex-col gap-0.5 text-xs">
          {partner.email && <span className="text-muted-foreground">{partner.email}</span>}
          {partner.phone && <span className="text-muted-foreground">{partner.phone}</span>}
          {!partner.email && !partner.phone && <span className="text-muted-foreground/40 italic">-</span>}
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
    id: 'actions',
    cell: ({ row }) => {
      const partner = row.original;
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
              <DropdownMenuItem onClick={() => onView(partner)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(partner)}>
                <EditIcon className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(partner)}>
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
