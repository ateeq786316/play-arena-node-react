import type { ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@playarena/shared/utils";

type Variant = "primary" | "outline" | "ghost" | "danger" | "cta";
type Size = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-pressed",
  outline: "border border-border bg-card text-foreground hover:bg-muted hover:border-foreground-secondary/30",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-danger text-white shadow-sm hover:bg-red-700 active:bg-red-800",
  cta:
    "bg-cta text-cta-foreground shadow-sm hover:bg-cta-hover active:bg-cta-pressed",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-3 text-sm gap-1.5",
  md: "h-12 px-5 text-sm gap-2 sm:h-[52px]",
  lg: "h-[52px] px-6 text-base gap-2",
  icon: "h-10 w-10",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-md font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
