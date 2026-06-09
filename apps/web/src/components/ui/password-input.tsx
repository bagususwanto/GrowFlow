"use client";

import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "./input";
import { cn } from "@web/lib/utils";

const PasswordInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative w-full">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground/80 hover:text-foreground transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {showPassword ? (
            <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">
            {showPassword ? "Sembunyikan password" : "Tampilkan password"}
          </span>
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
