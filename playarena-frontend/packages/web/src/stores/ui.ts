import { create } from "zustand";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  notificationUnreadCount: number;
  setNotificationUnreadCount: (count: number) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  notificationUnreadCount: 0,
  setNotificationUnreadCount: (count) => set({ notificationUnreadCount: count }),
}));
