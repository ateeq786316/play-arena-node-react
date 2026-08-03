"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AlertBanner } from "@/components/auth/AlertBanner";
import { ArrowLeftIcon, CheckCircleIcon } from "@/components/auth/icons";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"verifying" | "form" | "done" | "error">(token ? "verifying" : "error");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(token ? "" : "No reset token provided");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<{ userId: string; message: string }>(`/api/user/reset-password/${token}`)
      .then(() => {
        setStep("form");
      })
      .catch(() => {
        setMessage("Invalid or expired reset link");
        setStep("error");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/user/reset-password/confirm", { token, password });
      setStep("done");
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verifying") {
    return (
      <AuthShell title="Verifying your link" subtitle="Please wait a moment.">
        <div className="flex items-center justify-center py-6">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden="true" />
        </div>
        <p className="text-center text-sm text-muted-foreground">Checking your password reset link...</p>
      </AuthShell>
    );
  }

  if (step === "error") {
    return (
      <AuthShell title="Link expired or invalid" subtitle="We couldn&apos;t verify this reset link.">
        <AlertBanner className="mb-6">{message}</AlertBanner>
        <Link
          href="/forgot-password"
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
        >
          Request a new link
        </Link>
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (step === "done") {
    return (
      <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
        <div className="space-y-6">
          <div className="flex justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircleIcon className="h-8 w-8" />
            </span>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Your password has been reset successfully. Use your new password to sign in.
          </p>
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            Sign in now
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven&apos;t used before.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordField
          id="password"
          label="New password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint="Min 8 characters with 1 uppercase, 1 number, and 1 special character"
          autoComplete="new-password"
          required
        />
        <PasswordField
          id="confirm"
          label="Confirm new password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />

        {message && <AlertBanner>{message}</AlertBanner>}

        <AuthSubmitButton loading={loading} loadingText="Resetting...">
          Reset password
        </AuthSubmitButton>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-sm text-muted-foreground">Loading...</p></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
