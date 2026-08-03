"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@playarena/shared/utils";
import { FormField } from "./FormField";
import { EyeIcon, EyeOffIcon, LockIcon } from "./icons";

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size" | "type"> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
}

export function PasswordField({ label = "Password", error, hint, wrapperClassName, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      label={label}
      id={props.id}
      icon={<LockIcon className="h-4 w-4" />}
      error={error}
      hint={hint}
      wrapperClassName={wrapperClassName}
      type={visible ? "text" : "password"}
      autoComplete="current-password"
      {...props}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors",
            "hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      }
    />
  );
}
