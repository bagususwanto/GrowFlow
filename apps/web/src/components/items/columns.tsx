import { ColumnDef } from '@tanstack/react-table';
import { Item } from '@growflow/types';
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
import { EditIcon, EllipsisVerticalIcon, Trash2Icon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, EyeIcon, PackageIcon } from 'lucide-react';

interface ColumnActions {
  onView: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({ onView, onEdit, onDelete, sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<Item>[] => [
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
      const item = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <PackageIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span className="font-mono text-sm">{item.code}</span>
        </div>
      );
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
      return <span className="font-medium">{row.original.name}</span>;
    },
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const categoryName = row.original.category?.name || '-';
      return (
        <Badge variant="secondary" className="capitalize">
          {categoryName}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'unit',
    header: () => {
      const isSorted = sortBy === 'unit';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('unit')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Unit
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
      return <span>{row.original.unit}</span>;
    },
  },
  {
    accessorKey: 'minStock',
    header: () => {
      const isSorted = sortBy === 'minStock';
      return (
        <Button
          variant="ghost"
          onClick={() => onSort?.('minStock')}
          className="-ml-4 hover:bg-transparent font-semibold h-8 text-xs uppercase tracking-wider text-muted-foreground"
        >
          Min Stock
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
      return <span className="font-mono">{row.original.minStock}</span>;
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
      const item = row.original;
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
              <DropdownMenuItem onClick={() => onView(item)}>
                <EyeIcon className="mr-2 w-4 h-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <EditIcon className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(item)}>
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
