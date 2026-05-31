"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@web/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { Input } from "./input"

export interface ComboboxOption {
  value: string
  label: string
  searchKeywords?: string // Optional extra string to search by (e.g. code)
}

interface ComboboxProps {
  options: ComboboxOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No option found.",
  disabled = false,
  className,
  triggerClassName,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [options, value])

  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(query)
      const matchValue = opt.value.toLowerCase().includes(query)
      const matchKeywords = opt.searchKeywords?.toLowerCase().includes(query)
      return matchLabel || matchValue || matchKeywords
    })
  }, [options, searchQuery])

  // Reset search query when popover closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" />}
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-left shadow-xs transition-colors outline-hidden select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50",
            !selectedOption && "text-muted-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 pointer-events-none" />
        </PopoverTrigger>

        <PopoverContent className="w-[--anchor-width] p-0 overflow-hidden bg-popover text-popover-foreground border shadow-md rounded-lg z-50">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-9 w-full rounded-md bg-transparent py-3 text-sm outline-hidden border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "relative flex w-full cursor-default items-center rounded-md py-2 px-8 text-sm outline-hidden select-none hover:bg-accent hover:text-accent-foreground text-left",
                      isSelected && "font-medium bg-accent/40"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
