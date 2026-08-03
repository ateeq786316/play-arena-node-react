import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@playarena/shared/utils";
import { AlertCircleIcon } from "./icons";

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  icon?: ReactNode;
  error?: string;
  hint?: string;
  rightSlot?: ReactNode;
  wrapperClassName?: string;
  className?: string;
}

export function FormField({
  label,
  icon,
  error,
  hint,
  rightSlot,
  wrapperClassName,
  id,
  className,
  ...props
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">{icon}</span>}
        <input
          id={id}
          className={cn(
            "h-11 w-full rounded-xl border bg-card px-3.5 text-sm text-foreground shadow-sm transition-shadow placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-4",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
              : "border-border focus:border-primary focus:ring-primary/15",
            icon ? "pl-10" : undefined,
            rightSlot ? "pr-10" : undefined,
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
      </div>
      {error ? (
        <p id={`${id}-error`} className="flex items-center gap-1.5 text-xs font-medium text-red-600" role="alert">
          <AlertCircleIcon className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
