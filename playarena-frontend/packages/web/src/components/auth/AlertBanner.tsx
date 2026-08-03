import { cn } from "@playarena/shared/utils";
import { AlertCircleIcon, CheckCircleIcon, RefreshIcon } from "./icons";

type Tone = "error" | "success" | "info";

interface AlertBannerProps {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}

const tones: Record<Tone, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

const icons: Record<Tone, React.ComponentType<{ className?: string }>> = {
  error: AlertCircleIcon,
  success: CheckCircleIcon,
  info: RefreshIcon,
};

export function AlertBanner({ tone = "error", children, className }: AlertBannerProps) {
  const Icon = icons[tone];
  return (
    <div role="alert" className={cn("flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm", tones[tone], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
