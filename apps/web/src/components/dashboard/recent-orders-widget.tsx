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
import { PurchaseOrder, SalesOrder } from "@growflow/types"
import Link from "next/link"
import { ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react"

interface RecentOrdersWidgetProps {
  purchaseOrders?: PurchaseOrder[]
  salesOrders?: SalesOrder[]
}

function getStatusVariant(status: string) {
  switch (status) {
    case "DRAFT":
      return "outline"
    case "SUBMITTED":
    case "CONFIRMED":
      return "secondary"
    case "APPROVED":
    case "PARTIAL":
      return "default"
    case "DONE":
      return "success" as any
    case "CANCELLED":
      return "destructive"
    default:
      return "outline"
  }
}

export function RecentOrdersWidget({ purchaseOrders, salesOrders }: RecentOrdersWidgetProps) {
  const showPOs = purchaseOrders !== undefined
  const showSOs = salesOrders !== undefined

  if (!showPOs && !showSOs) return null

  // Calculate grid layout dynamically
  const gridClass = showPOs && showSOs 
    ? "grid grid-cols-1 gap-6 lg:grid-cols-2" 
    : "grid grid-cols-1 gap-6"

  return (
    <div className={gridClass}>
      {showPOs && (
        <Card className="shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <CardTitle>Recent Purchase Orders</CardTitle>
              </div>
              <CardDescription>Latest POs created in the system</CardDescription>
            </div>
            <Link
              href="/purchasing/purchase-orders"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {purchaseOrders.length === 0 ? (
              <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No purchase orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.map((po) => (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/purchasing/purchase-orders/${po.id}`}
                          className="hover:underline text-primary"
                        >
                          {po.number}
                        </Link>
                      </TableCell>
                      <TableCell>{po.supplier?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(po.status)} className="font-normal capitalize text-[10px] px-1.5 py-0.5">
                          {po.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        ${po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {showSOs && (
        <Card className="shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <CardTitle>Recent Sales Orders</CardTitle>
              </div>
              <CardDescription>Latest SOs created in the system</CardDescription>
            </div>
            <Link
              href="/sales/sales-orders"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 font-medium transition-colors"
            >
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {salesOrders.length === 0 ? (
              <div className="flex h-[150px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                No sales orders found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SO Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesOrders.map((so) => (
                    <TableRow key={so.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/sales/sales-orders/${so.id}`}
                          className="hover:underline text-primary"
                        >
                          {so.number}
                        </Link>
                      </TableCell>
                      <TableCell>{so.customer?.name || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(so.status)} className="font-normal capitalize text-[10px] px-1.5 py-0.5">
                          {so.status.toLowerCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        ${so.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
