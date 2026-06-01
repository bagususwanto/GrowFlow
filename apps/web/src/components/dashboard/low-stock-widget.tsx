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
import { Item } from "@growflow/types"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"

interface LowStockWidgetProps {
  items: Item[]
}

export function LowStockWidget({ items }: LowStockWidgetProps) {
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
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.slice(0, 5).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.code}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{item.minStock}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {item.category?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/inventory/items`}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Adjust Stock
                      </Link>
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
