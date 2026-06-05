"use client"

import React from "react"
import { useRoutePermission } from "@web/hooks/use-route-permission"
import { Forbidden } from "@web/components/forbidden"

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAllowed, isLoading } = useRoutePermission()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAllowed) {
    return <Forbidden />
  }

  return <>{children}</>
}
