"use client"

import Link from "next/link"
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
import { LayoutDashboard, Package, ShoppingCart, Sprout, Users, Shield, Warehouse, Boxes, Handshake } from "lucide-react"

import { hasPermission } from "@web/lib/permissions"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  permission?: string
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)

  const navGroups: NavGroup[] = [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboard />,
        },
        {
          title: "Partners Directory",
          url: "/relations/partners",
          icon: <Handshake />,
          permission: "read:partners",
        },
      ],
    },
    {
      label: "Inventory",
      items: [
        {
          title: "Items",
          url: "/inventory/items",
          icon: <Package />,
          permission: "read:items",
        },
        {
          title: "Warehouses",
          url: "/inventory/warehouses",
          icon: <Warehouse />,
          permission: "read:warehouses",
        },
        {
          title: "Stock",
          url: "/inventory/stock",
          icon: <Boxes />,
          permission: "read:inventory",
        },
      ],
    },
    {
      label: "Purchasing",
      items: [
        {
          title: "Purchase Orders",
          url: "/purchasing/purchase-orders",
          icon: <ShoppingCart />,
          permission: "read:po",
        },
        {
          title: "Goods Receipts",
          url: "/purchasing/goods-receipts",
          icon: <Boxes />,
          permission: "read:grn",
        },
        {
          title: "Suppliers",
          url: "/purchasing/suppliers",
          icon: <Handshake />,
          permission: "read:partners",
        },
        {
          title: "Products",
          url: "/purchasing/products",
          icon: <Package />,
          permission: "read:items",
        },
      ],
    },
    {
      label: "Sales",
      items: [
        {
          title: "Sales Orders",
          url: "/sales/sales-orders",
          icon: <ShoppingCart />,
          permission: "read:so",
        },
        {
          title: "Delivery Notes",
          url: "/sales/delivery-notes",
          icon: <Boxes />,
          permission: "read:dn",
        },
        {
          title: "Customers",
          url: "/sales/customers",
          icon: <Handshake />,
          permission: "read:partners",
        },
        {
          title: "Products",
          url: "/sales/products",
          icon: <Package />,
          permission: "read:items",
        },
      ],
    },
    {
      label: "Administration",
      items: [
        {
          title: "Users",
          url: "/administration/users",
          icon: <Users />,
          permission: "read:users",
        },
        {
          title: "Roles",
          url: "/administration/roles",
          icon: <Shield />,
          permission: "read:roles",
        },
      ],
    },
  ]

  const userPermissions = user?.permissions || []
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || hasPermission(userPermissions, item.permission)
      ),
    }))
    .filter((group) => group.items.length > 0)

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
              render={<Link href="/dashboard" />}
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
        <NavMain groups={filteredNavGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
