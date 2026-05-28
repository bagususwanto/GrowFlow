import { ColumnDef } from '@tanstack/react-table';
import { CategoryItem } from '@growflow/types';
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
import { EditIcon, EllipsisVerticalIcon, Trash2Icon, ArrowUpDownIcon, ArrowUpIcon, ArrowDownIcon, LayersIcon } from 'lucide-react';

interface ColumnActions {
  onEdit: (category: CategoryItem) => void;
  onDelete: (category: CategoryItem) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}

export const getColumns = ({ onEdit, onDelete, sortBy, sortOrder, onSort }: ColumnActions): ColumnDef<CategoryItem>[] => [
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
          Category Name
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
      const category = row.original;
      return (
        <div className="flex items-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-muted rounded-full w-8 h-8">
            <LayersIcon className="w-4 h-4 text-muted-foreground" />
          </div>
          <span>{category.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      return <span className="text-muted-foreground text-sm">{row.original.description || '-'}</span>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return <span className="text-sm">{new Date(row.original.createdAt).toLocaleString()}</span>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const category = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(category)}>
                <EditIcon className="mr-2 w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(category)}>
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
