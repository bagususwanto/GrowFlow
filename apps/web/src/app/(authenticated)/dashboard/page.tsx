"use client"

import { useDashboardSummary } from "@web/hooks/use-dashboard"
import { useAuthStore } from "@web/stores/auth.store"
import { MetricsWidget } from "@web/components/dashboard/metrics-widget"
import { LowStockWidget } from "@web/components/dashboard/low-stock-widget"
import { RecentOrdersWidget } from "@web/components/dashboard/recent-orders-widget"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const { data: summary, isLoading, error } = useDashboardSummary()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !summary) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-2 px-4 text-center">
        <p className="text-sm font-semibold text-destructive">Failed to load dashboard statistics</p>
        <p className="text-xs text-muted-foreground">Please try refreshing the page or contact support.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      {/* Title section */}
      <div className="px-4 lg:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back, <span className="font-semibold text-primary">{user?.name}</span> ({user?.role})
        </p>
      </div>

      {/* Metrics Cards */}
      <MetricsWidget data={summary} />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 gap-6 px-4 lg:px-6">
        {/* Render Low Stock Alerts if the user has access to item data */}
        {summary.lowStockItems && (
          <LowStockWidget items={summary.lowStockItems} />
        )}

        {/* Render Recent Orders Grid */}
        {(summary.recentPurchaseOrders || summary.recentSalesOrders) && (
          <RecentOrdersWidget
            purchaseOrders={summary.recentPurchaseOrders}
            salesOrders={summary.recentSalesOrders}
          />
        )}
      </div>
    </div>
  )
}
