"use client"

import * as React from "react"

import { NavMain } from "@web/components/nav-main"
import { NavUser } from "@web/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@web/components/ui/sidebar"
import { useAuthStore } from "@web/stores/auth.store"
import { LayoutDashboard, Package, ShoppingCart, FileText, Sprout } from "lucide-react"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      title: "Inventory",
      url: "#",
      icon: <Package />,
    },
    {
      title: "Purchase",
      url: "#",
      icon: <ShoppingCart />,
    },
    {
      title: "Sales Order",
      url: "#",
      icon: <FileText />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)

  const sidebarUser = {
    name: user?.name || "GrowFlow User",
    email: user?.email || "user@growflow.com",
    avatar: "",
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/dashboard" />}
            >
              <div className="flex aspect-square size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sprout className="size-4" />
              </div>
              <span className="text-base font-semibold bg-linear-to-r from-foreground via-foreground/90 to-foreground/75 bg-clip-text text-transparent">GrowFlow</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
