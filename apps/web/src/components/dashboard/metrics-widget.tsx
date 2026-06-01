"use client"

import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "@web/components/ui/card"
import { DashboardSummaryResponse } from "@growflow/types"
import { Package, ShoppingCart, ShoppingBag, Clock, CheckCircle } from "lucide-react"

interface MetricsWidgetProps {
  data: DashboardSummaryResponse
}

export function MetricsWidget({ data }: MetricsWidgetProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 md:grid-cols-2 lg:grid-cols-4">
      {data.totalItems !== undefined && (
        <Card className="@container/card shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription>Total Items</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-foreground">
                {data.totalItems}
              </CardTitle>
            </div>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-1">
            Active inventory items
          </CardContent>
        </Card>
      )}

      {data.totalPurchaseOrders !== undefined && (
        <Card className="@container/card shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription>Total Purchase Orders</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-foreground">
                {data.totalPurchaseOrders}
              </CardTitle>
            </div>
            <ShoppingCart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-1">
            Total purchase transactions
          </CardContent>
        </Card>
      )}

      {data.pendingPurchaseOrders !== undefined && (
        <Card className="@container/card shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription>Pending PO Approvals</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-warning">
                {data.pendingPurchaseOrders}
              </CardTitle>
            </div>
            <Clock className="h-5 w-5 text-warning" />
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-1">
            POs waiting for manager approval
          </CardContent>
        </Card>
      )}

      {data.totalSalesOrders !== undefined && (
        <Card className="@container/card shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription>Total Sales Orders</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-foreground">
                {data.totalSalesOrders}
              </CardTitle>
            </div>
            <ShoppingBag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-1">
            Total sales transactions
          </CardContent>
        </Card>
      )}

      {data.pendingSalesOrders !== undefined && (
        <Card className="@container/card shadow-sm border border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription>Pending SO Deliveries</CardDescription>
              <CardTitle className="text-2xl font-bold tabular-nums text-info">
                {data.pendingSalesOrders}
              </CardTitle>
            </div>
            <Clock className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground pt-1">
            Confirmed SOs waiting for delivery
          </CardContent>
        </Card>
      )}
    </div>
  )
}
