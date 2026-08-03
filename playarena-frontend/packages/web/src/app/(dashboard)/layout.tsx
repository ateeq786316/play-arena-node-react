"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Toaster } from "@/components/ui/Toaster";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useUiStore } from "@/stores/ui";
import { cn } from "@playarena/shared/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[margin] duration-300",
          collapsed ? "ml-16" : "ml-60",
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
