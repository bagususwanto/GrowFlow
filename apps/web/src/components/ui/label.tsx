"use client"

import * as React from "react"

import { cn } from "@web/lib/utils"

interface LabelProps extends React.ComponentProps<"label"> {
  required?: boolean
  optional?: boolean
}

function Label({ className, children, required, optional, ...props }: LabelProps) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1.5 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span>{children}</span>
      {required && <span className="text-destructive font-semibold">*</span>}
      {optional && <span className="text-[10px] text-muted-foreground lowercase font-normal">(opsional)</span>}
    </label>
  )
}

export { Label }
