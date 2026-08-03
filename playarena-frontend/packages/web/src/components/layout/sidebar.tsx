"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  CalendarDays,
  Users,
  Swords,
  Trophy,
  BarChart3,
  MessageCircle,
  Bell,
  Wallet,
  Building2,
  CreditCard,
  LineChart,
  Megaphone,
  Tag,
  Scale,
  ShieldCheck,
  LogOut,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useUiStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useAuthorization } from "@/lib/use-authorization";
import { cn } from "@playarena/shared/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: string[];
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: "Main",
    items: [
      { href: "/home", label: "Home", icon: Home, roles: ["player", "owner", "manager", "staff", "admin", "super_admin"] },
      { href: "/bookings", label: "My Bookings", icon: CalendarDays, roles: ["player", "owner", "admin", "super_admin"] },
      { href: "/teams", label: "Teams", icon: Users, roles: ["player"] },
      { href: "/matches", label: "Matches", icon: Swords, roles: ["player"] },
      { href: "/tournaments", label: "Tournaments", icon: Trophy, roles: ["player", "owner", "admin", "super_admin"] },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart3, roles: ["player"] },
      { href: "/chat", label: "Chat", icon: MessageCircle, roles: ["player", "owner", "manager", "staff", "admin", "super_admin"] },
      { href: "/notifications", label: "Notifications", icon: Bell, roles: ["player", "owner", "manager", "staff", "admin", "super_admin"] },
    ],
  },
  {
    label: "Grounds & Ops",
    items: [
      { href: "/grounds", label: "My Grounds", icon: Building2, roles: ["owner", "admin", "super_admin"] },
      { href: "/ops", label: "Operations", icon: Activity, roles: ["manager", "staff"] },
      { href: "/finance", label: "Finance", icon: Wallet, roles: ["owner", "manager", "admin", "super_admin"] },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/subscriptions", label: "Subscriptions", icon: CreditCard, roles: ["owner"] },
      { href: "/analytics", label: "Analytics", icon: LineChart, roles: ["owner", "manager", "admin", "super_admin"] },
      { href: "/crm", label: "CRM & Broadcasts", icon: Megaphone, roles: ["owner"] },
      { href: "/pricing", label: "Pricing & Coupons", icon: Tag, roles: ["owner"] },
      { href: "/disputes", label: "Disputes", icon: Scale, roles: ["player", "owner"] },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/admin", label: "Admin Dashboard", icon: ShieldCheck, roles: ["admin", "super_admin"] },
    ],
  },
];

function roleMatches(roles: string[], role: string): boolean {
  if (roles.includes(role)) return true;
  if (role === "super_admin") return true;
  if (role === "admin") return roles.some((r) => r === "admin" || r === "super_admin" || r === "player");
  return false;
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const user = useAuthStore((s) => s.user);
  const { role } = useAuthorization();
  const logout = useAuthStore((s) => s.logout);

  const groups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((i) => roleMatches(i.roles, role)) }))
    .filter((g) => g.items.length > 0);

  const isActive = (href: string) => (href === "/home" ? pathname === "/home" : pathname.startsWith(href));

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-30 flex h-full flex-col bg-sidebar text-slate-300 transition-all duration-300",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className={cn("flex h-16 items-center gap-2.5 border-b border-slate-800 px-4", collapsed && "justify-center px-0")}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Trophy className="h-5 w-5" />
        </div>
        {!collapsed && (
          <span className="font-heading text-2xl tracking-wide text-white">PLAYARENA</span>
        )}
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto p-3">
        {groups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-primary/15 font-medium text-white"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-white",
                      collapsed && "justify-center px-0",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-primary" : "text-slate-400 group-hover:text-white")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className={cn("border-t border-slate-800 p-3", collapsed && "px-0")}>
        <div className={cn("flex items-center gap-3 rounded-md px-2 py-2", collapsed && "justify-center px-0")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 font-semibold text-primary">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name || "Player"}</p>
              <p className="truncate text-xs capitalize text-slate-500">{role.replace("_", " ")}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              aria-label="Log out"
              className="text-slate-500 transition-colors hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
