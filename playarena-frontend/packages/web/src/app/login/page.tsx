"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AlertBanner } from "@/components/auth/AlertBanner";
import { MailIcon } from "@/components/auth/icons";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, fieldErrors, clearErrors } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getError = (field: string) => fieldErrors.find((e) => e.field === field)?.msg;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    clearErrors();
    setLoading(true);
    try {
      await login(email, password);
      const redirect = searchParams.get("redirect") || "/home";
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (!fieldErrors.length) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={<MailIcon className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={getError("email")}
          required
        />
        <div>
          <PasswordField
            id="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={getError("password")}
            required
          />
          <div className="mt-2 text-right">
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && <AlertBanner>{error}</AlertBanner>}

        <AuthSubmitButton loading={loading} loadingText="Signing in...">
          Sign in
        </AuthSubmitButton>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wider text-muted-foreground">
          <span className="bg-background px-3">New here?</span>
        </div>
      </div>

      <Link
        href="/signup"
        className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
      >
        Create an account
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to book courts, form teams, and compete.">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
