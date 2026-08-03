"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { api } from "@playarena/shared/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch("/api/user/profile", { name });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Profile</h1>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div>
          <p className="font-medium text-lg">{user?.name}</p>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium mt-1 ${user?.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
            {user?.isVerified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input value={user?.email || ""} disabled className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mobile</label>
          <input value={user?.mobile || ""} disabled className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground" />
        </div>
        <button type="submit" disabled={saving} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="pt-4 border-t border-border">
        <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
          Sign out
        </button>
      </div>
    </div>
  );
}
