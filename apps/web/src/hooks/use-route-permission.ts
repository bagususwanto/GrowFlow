"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@web/stores/auth.store"
import { ROUTE_PERMISSIONS } from "@web/lib/route-permissions"
import { hasPermission } from "@web/lib/permissions"

export function useRoutePermission() {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  // Find matching route mapping.
  // We sort route patterns by length descending to match most specific subpaths first.
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(route + "/"))

  const requiredPermission = matchedRoute ? ROUTE_PERMISSIONS[matchedRoute] : null
  const userPermissions = user?.permissions || []

  // If route doesn't have explicit permission mapping, allow access by default (like /dashboard, /profile)
  const isAllowed = !requiredPermission || hasPermission(userPermissions, requiredPermission)

  return {
    isAllowed,
    requiredPermission,
    isLoading: !user, // Loading if user metadata isn't initialized yet
  }
}
