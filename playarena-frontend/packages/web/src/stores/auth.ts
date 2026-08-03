import { create } from "zustand";
import { api, ApiError } from "@playarena/shared/api";
import type { User } from "@playarena/shared/types";

interface FieldError {
  field: string;
  msg: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  fieldErrors: FieldError[];
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, mobile: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearErrors: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  fieldErrors: [],

  clearErrors: () => set({ fieldErrors: [] }),

  login: async (email, password) => {
    try {
      const res = await api.post<{ message: string; user: User }>("/api/user/login", { email, password });
      set({ user: res.user, isAuthenticated: true, fieldErrors: [] });
    } catch (err) {
      if (err instanceof ApiError) set({ fieldErrors: err.errors || [] });
      throw err;
    }
  },

  signup: async (name, email, password, mobile) => {
    try {
      const res = await api.post<{ message: string; user: User }>("/api/user/register", { name, email, password, mobile });
      set({ user: res.user, isAuthenticated: true, fieldErrors: [] });
    } catch (err) {
      if (err instanceof ApiError) set({ fieldErrors: err.errors || [] });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/api/user/logout");
    } catch {
      // Ignore errors on logout - still clear local state
    }
    set({ user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const res = await api.get<{ user: User }>("/api/user/profile");
      set({ user: res.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
}));
