'use client'

import * as React from "react"
import { Separator } from "@web/components/ui/separator"
import { SidebarTrigger } from "@web/components/ui/sidebar"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@web/components/ui/breadcrumb"
import { useBreadcrumbStore } from "@web/stores/breadcrumb.store"

interface BreadcrumbItemType {
  label: string;
  href?: string;
  isPage: boolean;
}

export function SiteHeader() {
  const pathname = usePathname()
  
  const entityLabels = useBreadcrumbStore((state) => state.entityLabels)
  
  const getBreadcrumbs = React.useMemo(() => {
    if (!pathname) return [{ label: "Dashboard", isPage: true }]
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
      return [{ label: "Dashboard", isPage: true }]
    }

    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)

    const items: BreadcrumbItemType[] = [
      { label: "Dashboard", href: "/dashboard", isPage: false },
    ]

    let currentPath = ""
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      currentPath += `/${segment}`

      const noPageSegments = ["inventory", "purchasing", "relations", "administration", "sales"]
      if (noPageSegments.includes(segment)) {
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
        items.push({ label, isPage: false })
        continue
      }

      const isLast = i === segments.length - 1
      const isCurrentUuid = isUuid(segment)

      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")
      const href: string | undefined = currentPath

      if (segment === "users") {
        label = "Users"
      } else if (segment === "roles") {
        label = "Roles"
      } else if (isCurrentUuid) {
        label = entityLabels[segment] ?? "Details"
      } else if (segment === "new") {
        const parent = segments[i - 1]
        label = parent === "users" ? "Create User" : parent === "roles" ? "Create Role" : "New"
      } else if (segment === "edit") {
        const grandParent = segments[i - 2]
        label = grandParent === "users" ? "Edit User" : grandParent === "roles" ? "Edit Role" : "Edit"
      }

      const isPage = isLast

      items.push({
        label,
        href: isPage ? undefined : href,
        isPage,
      })
    }

    return items
  }, [pathname, entityLabels])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {getBreadcrumbs.map((item, idx) => {
              const isLast = idx === getBreadcrumbs.length - 1
              return (
                <React.Fragment key={idx}>
                  <BreadcrumbItem>
                    {item.isPage ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : item.href ? (
                      <BreadcrumbLink render={<Link href={item.href} />}>
                        {item.label}
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground cursor-default select-none">{item.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
