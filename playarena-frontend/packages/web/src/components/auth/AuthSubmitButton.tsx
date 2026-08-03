"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@playarena/shared/utils";
import { ArrowRightIcon } from "./icons";

interface AuthSubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export function AuthSubmitButton({ loading = false, loadingText, children, className, disabled, ...props }: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className={cn(
        "group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all",
        "hover:bg-primary/90 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingText || "Please wait..."}
        </>
      ) : (
        <>
          {children}
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </>
      )}
    </button>
  );
}
