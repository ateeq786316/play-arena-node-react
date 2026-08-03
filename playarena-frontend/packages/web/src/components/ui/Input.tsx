import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@playarena/shared/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
}

export function Input({ label, icon, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]+/g, "-") : undefined);
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-desc` : undefined}
          className={cn(
            "h-12 w-full rounded-md border bg-card px-4 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-muted sm:h-[52px]",
            icon ? "pl-10" : undefined,
            error ? "border-danger focus:ring-danger" : "border-border",
            className,
          )}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-desc`} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-desc`} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
