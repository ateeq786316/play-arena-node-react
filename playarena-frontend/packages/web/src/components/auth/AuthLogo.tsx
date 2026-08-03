import Link from "next/link";
import { cn } from "@playarena/shared/utils";

interface AuthLogoProps {
  className?: string;
  tone?: "light" | "dark";
  href?: string;
}

export function AuthLogo({ className, tone = "dark", href = "/" }: AuthLogoProps) {
  const mark = (
    <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-white" aria-hidden="true">
        <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.9l11.03-6.86a1.05 1.05 0 0 0 0-1.8L9.56 4.24c-.69-.4-1.56.1-1.56.9z" />
        <circle cx="8" cy="12" r="1.2" />
      </svg>
      <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-amber-400" />
    </span>
  );

  const wordmark = (
    <span className={cn("text-xl font-extrabold tracking-tight", tone === "dark" ? "text-foreground" : "text-white")}>
      Play<span className="text-emerald-500">Arena</span>
    </span>
  );

  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="PlayArena home">
      {mark}
      {wordmark}
    </Link>
  );
}
