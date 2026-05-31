import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, ChevronRight } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@web/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
}

interface NavGroup {
  label?: string
  items: NavItem[]
}

export function NavMain({
  groups,
}: {
  groups: NavGroup[]
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({})

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("sidebar_collapsed")
      if (stored) {
        setCollapsed(JSON.parse(stored))
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  const toggleGroup = (label: string) => {
    setCollapsed((prev) => {
      const updated = { ...prev, [label]: !prev[label] }
      try {
        localStorage.setItem("sidebar_collapsed", JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
  }

  return (
    <>
      {groups.map((group, index) => {
        const groupLabel = group.label || `Group ${index}`
        const isCollapsed = collapsed[groupLabel] ?? false;

        return (
          <SidebarGroup key={groupLabel}>
            {group.label && (
              <SidebarGroupLabel
                className="flex items-center justify-between cursor-pointer hover:text-foreground select-none"
                onClick={() => toggleGroup(groupLabel)}
              >
                <span>{group.label}</span>
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3 shrink-0 opacity-70" />
                ) : (
                  <ChevronDown className="h-3 w-3 shrink-0 opacity-70" />
                )}
              </SidebarGroupLabel>
            )}
            
            {!isCollapsed && (
              <SidebarGroupContent className="flex flex-col gap-2 transition-all duration-200">
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive =
                      item.url === "/dashboard" || item.url === "/"
                        ? pathname === item.url
                        : pathname === item.url || (item.url !== "#" && pathname?.startsWith(item.url + "/"));
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          render={<Link href={item.url} />}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        );
      })}
    </>
  )
}
