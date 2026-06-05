import React from 'react';
import AuthGuard from '@web/components/auth/auth-guard';
import { AppSidebar } from "@web/components/app-sidebar"
import { SiteHeader } from "@web/components/site-header"
import { SidebarInset, SidebarProvider } from "@web/components/ui/sidebar"
import { RouteGuard } from "@web/components/auth/route-guard"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <RouteGuard>{children}</RouteGuard>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  )
}
