"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${React.useId()}`;

    return (
      <div className="w-full">
        <div className="flex items-start gap-3">
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              className={cn(
                "peer h-5 w-5 shrink-0 appearance-none rounded border-2 border-border bg-background transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-primary",
                "checked:bg-primary checked:border-primary",
                "disabled:cursor-not-allowed disabled:opacity-50",
                error && "border-destructive",
                className
              )}
              {...props}
            />
            <Check className="absolute h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className="text-sm text-foreground leading-snug cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1.5 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
