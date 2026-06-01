"use client"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@web/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@web/components/ui/table"
import { Badge } from "@web/components/ui/badge"
import { LowStockItem } from "@growflow/types"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertTriangle, EllipsisVerticalIcon, WrenchIcon, ShoppingCartIcon } from "lucide-react"
import { Button } from "@web/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@web/components/ui/dropdown-menu"


interface LowStockWidgetProps {
  items: LowStockItem[]
}

export function LowStockWidget({ items }: LowStockWidgetProps) {
  const router = useRouter();
  return (
    <Card className="shadow-sm border border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <CardTitle>Low Stock Alerts</CardTitle>
          </div>
          <CardDescription>
            Items that are below minimum stock level and need attention.
          </CardDescription>
        </div>
        <Badge variant="destructive" className="font-semibold">
          {items.length} Items
        </Badge>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            No items are below minimum stock levels.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 5).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold text-xs">
                        {item.warehouseName}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {item.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {item.minStock} {item.unit}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-bold text-destructive">
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              className="flex data-[state=open]:bg-muted p-0 w-8 h-8 text-muted-foreground ml-auto"
                              size="icon"
                            >
                              <EllipsisVerticalIcon className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => router.push(`/inventory/stock/adjust?itemId=${item.itemId}&warehouseId=${item.warehouseId || ''}`)}>
                            <WrenchIcon className="mr-2 w-4 h-4" />
                            Adjust Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/purchasing/purchase-orders/new?itemId=${item.itemId}`)}>
                            <ShoppingCartIcon className="mr-2 w-4 h-4" />
                            Create PO
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {items.length > 5 && (
              <div className="mt-3 text-center">
                <Link
                  href="/inventory/items"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  View all low stock items ({items.length})
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
