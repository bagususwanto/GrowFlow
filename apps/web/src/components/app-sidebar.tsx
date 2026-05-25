"use client"

import * as React from "react"
import { LayoutDashboard, Boxes, ShoppingCart, DollarSign } from "lucide-react"

import { NavMain } from "@web/components/nav-main"
import { NavUser } from "@web/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@web/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      title: "Inventory",
      url: "#",
      icon: <Boxes />,
      badge: "Soon",
      disabled: true,
    },
    {
      title: "Purchasing",
      url: "#",
      icon: <ShoppingCart />,
      badge: "Soon",
      disabled: true,
    },
    {
      title: "Sales",
      url: "#",
      icon: <DollarSign />,
      badge: "Soon",
      disabled: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground font-bold shadow-md shadow-sidebar-primary/20 shrink-0">
            G
          </div>
          <span className="text-xl font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            GrowFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
