"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@playarena/shared/utils";

export interface TabItem {
  value: string;
  label: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  children: (active: string) => ReactNode;
  className?: string;
}

export function Tabs({ items, defaultValue, value, onChange, children, className }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue || items[0]?.value || "");
  const active = value ?? internal;

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-border">
        {items.map((item) => {
          const selected = active === item.value;
          return (
            <button
              key={item.value}
              role="tab"
              aria-selected={selected}
              onClick={() => {
                setInternal(item.value);
                onChange?.(item.value);
              }}
              className={cn(
                "cursor-pointer whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                selected
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      <div className="pt-4">{children(active)}</div>
    </div>
  );
}
