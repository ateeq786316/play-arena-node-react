"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";
import { useToast } from "@/components/ui/Toaster";
import { api } from "@playarena/shared/api";
import { DropdownMenu, DropdownItem } from "@/components/ui/DropdownMenu";
import { Avatar } from "@/components/ui/Avatar";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const unreadCount = useUiStore((s) => s.notificationUnreadCount);
  const setUnreadCount = useUiStore((s) => s.setNotificationUnreadCount);
  const logout = useAuthStore((s) => s.logout);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    api
      .get<{ count: number }>("/api/notifications/unread-count")
      .then((res) => setUnreadCount(res.count))
      .catch(() => {});
  }, [setUnreadCount]);

  const handleLogout = async () => {
    await logout();
    toast("Logged out successfully");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <button
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          className="relative rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        <DropdownMenu
          trigger={
            <button aria-label="Account menu" className="rounded-full transition-opacity hover:opacity-80">
              <Avatar name={user?.name || "Player"} src={user?.avatar} />
            </button>
          }
        >
          <div className="px-3 pb-1 pt-1.5">
            <p className="truncate text-sm font-semibold text-foreground">{user?.name || "Player"}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="my-1 border-t border-border" />
          <DropdownItem onSelect={() => router.push("/profile")}>
            <User className="h-4 w-4" />
            Profile
          </DropdownItem>
          <DropdownItem onSelect={handleLogout} className="text-danger hover:bg-red-50">
            <span className="text-danger">Log out</span>
          </DropdownItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
