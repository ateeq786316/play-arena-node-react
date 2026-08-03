"use client";

import { useAuthStore } from "@/stores/auth";

export type PlatformRole = "player" | "owner" | "manager" | "staff" | "admin" | "super_admin";
export type GroundAccessRole = "owner" | "manager" | "staff";

const groundRoleHierarchy: Record<GroundAccessRole, number> = { staff: 1, manager: 2, owner: 3 };

export function useAuthorization() {
  const user = useAuthStore((s) => s.user);

  const role = (user?.role || "player").toLowerCase() as PlatformRole;

  const hasRole = (...roles: PlatformRole[]): boolean => roles.includes(role);

  const isAdmin = () => role === "admin" || role === "super_admin";
  const isOwner = () => role === "owner" || role === "admin" || role === "super_admin";
  const isPlayer = () => role === "player";

  const can = (action: string, resource: "ground" | "team" | "match" | "platform" = "platform"): boolean => {
    switch (resource) {
      case "ground":
        switch (action) {
          case "create":
          case "edit":
          case "delete":
          case "settings":
          case "invite_staff":
          case "reports":
            return isOwner();
          case "manage_courts":
          case "schedules":
          case "staff_manage":
            return isOwner();
          case "record_payment":
          case "walkin":
          case "cash_session":
            return role === "staff" || role === "manager" || role === "owner";
          case "view_finance":
            return role === "manager" || role === "owner";
          default:
            return false;
        }
      case "team":
        return role === "player";
      case "match":
        return role === "player";
      case "platform":
      default:
        return isAdmin();
    }
  };

  const hasGroundAccess = (accessRole?: GroundAccessRole | null): boolean => {
    if (!accessRole) return false;
    return groundRoleHierarchy[role as GroundAccessRole] >= groundRoleHierarchy[accessRole] || isAdmin();
  };

  return { role, user, hasRole, isAdmin, isOwner, isPlayer, can, hasGroundAccess };
}
