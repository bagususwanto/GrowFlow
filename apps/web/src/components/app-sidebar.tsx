"use client"

import Link from "next/link"
import * as React from "react"
import Image from "next/image"

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
import { LayoutDashboard, Package, ShoppingCart, Users, Shield, Warehouse, Boxes, Handshake, FileText as FileTextIcon, Landmark, FileSpreadsheet, BarChart, Settings } from "lucide-react"

import { hasPermission } from "@web/lib/permissions"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  permission?: string
  roles?: string[]
}

interface NavGroup {
  label?: string
  items: NavItem[]
  roles?: string[]
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <LayoutDashboard />,
        },
        {
          title: "Partners Directory",
          url: "/partners",
          icon: <Handshake />,
          permission: "read:partners",
        },
      ],
    },
    {
      label: "Inventory",
      roles: ["superadmin", "manager", "warehouse", "purchasing", "sales"],
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
          permission: "read:stock",
        },
      ],
    },
    {
      label: "Logistics",
      roles: ["superadmin", "manager", "warehouse", "purchasing"],
      items: [
        {
          title: "Goods Receipts",
          url: "/logistics/goods-receipts",
          icon: <Boxes />,
          permission: "read:goods-receipts",
        },
        {
          title: "Delivery Notes",
          url: "/logistics/delivery-notes",
          icon: <Boxes />,
          permission: "read:delivery-notes",
        },
      ],
    },
    {
      label: "Purchasing",
      roles: ["superadmin", "manager", "purchasing", "finance"],
      items: [
        {
          title: "Purchase Orders",
          url: "/purchasing/purchase-orders",
          icon: <ShoppingCart />,
          permission: "read:purchase-orders",
          roles: ["superadmin", "manager", "purchasing"],
        },
        {
          title: "Vendor Invoices",
          url: "/purchasing/vendor-invoices",
          icon: <FileTextIcon />,
          permission: "read:invoices",
        },
        {
          title: "Suppliers",
          url: "/purchasing/suppliers",
          icon: <Handshake />,
          permission: "read:partners",
          roles: ["superadmin", "manager", "purchasing"],
        },
      ],
    },
    {
      label: "Sales",
      roles: ["superadmin", "manager", "sales", "finance"],
      items: [
        {
          title: "Sales Orders",
          url: "/sales/sales-orders",
          icon: <ShoppingCart />,
          permission: "read:sales-orders",
          roles: ["superadmin", "manager", "sales"],
        },
        {
          title: "Sales Invoices",
          url: "/sales/invoices",
          icon: <FileTextIcon />,
          permission: "read:invoices",
        },
        {
          title: "Customers",
          url: "/sales/customers",
          icon: <Handshake />,
          permission: "read:partners",
          roles: ["superadmin", "manager", "sales"],
        },
      ],
    },
    {
      label: "Accounting",
      roles: ["superadmin", "manager", "finance"],
      items: [
        {
          title: "Chart of Accounts",
          url: "/accounting/chart-of-accounts",
          icon: <Landmark />,
          permission: "read:accounting",
        },
        {
          title: "Journal Entries",
          url: "/accounting/journal-entries",
          icon: <FileSpreadsheet />,
          permission: "read:accounting",
        },
        {
          title: "Trial Balance",
          url: "/accounting/reports/trial-balance",
          icon: <BarChart />,
          permission: "read:accounting",
        },
        {
          title: "Profit & Loss",
          url: "/accounting/reports/profit-loss",
          icon: <BarChart />,
          permission: "read:accounting",
        },
        {
          title: "AP Aging Report",
          url: "/accounting/reports/ap-aging",
          icon: <BarChart />,
          permission: "read:accounting",
        },
        {
          title: "AR Aging Report",
          url: "/accounting/reports/ar-aging",
          icon: <BarChart />,
          permission: "read:accounting",
        },
        {
          title: "Settings",
          url: "/accounting/settings",
          icon: <Settings />,
          permission: "admin:accounting",
        },
      ],
    },
    {
      label: "Administration",
      roles: ["superadmin", "manager"],
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

  const userRole = user?.role
  const userPermissions = user?.permissions || []
  const filteredNavGroups = navGroups
    .filter((group) => !group.roles || (userRole && group.roles.includes(userRole)))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          (!item.roles || (userRole && item.roles.includes(userRole))) &&
          (!item.permission || hasPermission(userPermissions, item.permission))
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
              <div className="flex aspect-square size-6 items-center justify-center rounded-md overflow-hidden bg-transparent">
                <Image
                  src="/assets/logo.png"
                  alt="GrowFlow Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
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
