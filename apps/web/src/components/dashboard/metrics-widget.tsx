"use client"

import {
  Card,
  CardContent,
} from "@web/components/ui/card"
import { DashboardSummaryResponse } from "@growflow/types"
import { Package, ShoppingCart, ShoppingBag, Clock } from "lucide-react"

interface MetricsWidgetProps {
  data: DashboardSummaryResponse
}

export function MetricsWidget({ data }: MetricsWidgetProps) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {/* Card 1: Total Items */}
      {data.totalItems !== undefined && (
        <Card className="@container/card group relative overflow-hidden border border-teal-500/10 bg-teal-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-teal-500/20 hover:shadow-lg hover:shadow-teal-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-teal-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-teal-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-teal-400">Total Items</p>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums block">
                {data.totalItems}
              </span>
              <p className="text-xs text-muted-foreground pt-1">Active inventory items</p>
            </div>
            <div className="rounded-2xl bg-teal-500/10 p-3 text-teal-400 transition-all duration-300 group-hover:bg-teal-500/20 group-hover:scale-110">
              <Package className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 2: Total Purchase Orders */}
      {data.totalPurchaseOrders !== undefined && (
        <Card className="@container/card group relative overflow-hidden border border-indigo-500/10 bg-indigo-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-indigo-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-indigo-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-indigo-400">Total Purchase Orders</p>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums block">
                {data.totalPurchaseOrders}
              </span>
              <p className="text-xs text-muted-foreground pt-1">Total purchase transactions</p>
            </div>
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400 transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:scale-110">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 3: Pending PO Approvals */}
      {data.pendingPurchaseOrders !== undefined && (
        <Card className="@container/card group relative overflow-hidden border border-amber-500/10 bg-amber-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/20 hover:shadow-lg hover:shadow-amber-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-amber-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-amber-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-amber-400">Pending PO Approvals</p>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums block">
                {data.pendingPurchaseOrders}
              </span>
              <p className="text-xs text-muted-foreground pt-1">Waiting for approval</p>
            </div>
            <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-400 transition-all duration-300 group-hover:bg-amber-500/20 group-hover:scale-110 animate-pulse">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 4: Total Sales Orders */}
      {data.totalSalesOrders !== undefined && (
        <Card className="@container/card group relative overflow-hidden border border-rose-500/10 bg-rose-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-rose-500/20 hover:shadow-lg hover:shadow-rose-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-rose-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-rose-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-rose-400">Total Sales Orders</p>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums block">
                {data.totalSalesOrders}
              </span>
              <p className="text-xs text-muted-foreground pt-1">Total sales transactions</p>
            </div>
            <div className="rounded-2xl bg-rose-500/10 p-3 text-rose-400 transition-all duration-300 group-hover:bg-rose-500/20 group-hover:scale-110">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card 5: Pending SO Deliveries */}
      {data.pendingSalesOrders !== undefined && (
        <Card className="@container/card group relative overflow-hidden border border-sky-500/10 bg-sky-500/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-sky-500/20 hover:shadow-lg hover:shadow-sky-500/5">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-20 w-20 rounded-full bg-sky-500/10 blur-xl transition-all duration-300 group-hover:scale-125 group-hover:bg-sky-500/20" />
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wider uppercase text-sky-400">Pending SO Deliveries</p>
              <span className="text-2xl font-extrabold tracking-tight text-foreground tabular-nums block">
                {data.pendingSalesOrders}
              </span>
              <p className="text-xs text-muted-foreground pt-1">Waiting for delivery</p>
            </div>
            <div className="rounded-2xl bg-sky-500/10 p-3 text-sky-400 transition-all duration-300 group-hover:bg-sky-500/20 group-hover:scale-110">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
