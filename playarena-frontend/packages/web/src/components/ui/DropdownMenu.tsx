"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@playarena/shared/utils";

interface DropdownMenuProps {
  trigger: ReactNode;
  align?: "left" | "right";
  children: ReactNode | ((close: () => void) => ReactNode);
}

export function DropdownMenu({ trigger, align = "right", children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((v) => !v)}>{trigger}</div>
      {open && (
        <div
          role="menu"
          className={cn(
            "animate-slide-up absolute z-40 mt-2 min-w-44 rounded-md border border-border bg-card p-1.5 shadow-modal",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {typeof children === "function" ? children(() => setOpen(false)) : children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({
  onSelect,
  className,
  children,
}: {
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
