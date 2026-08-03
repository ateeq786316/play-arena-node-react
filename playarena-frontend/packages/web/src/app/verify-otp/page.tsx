"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@playarena/shared/api";
import { AuthShell } from "@/components/auth/AuthShell";
import { OtpInput } from "@/components/auth/OtpInput";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AlertBanner } from "@/components/auth/AlertBanner";
import { MailIcon } from "@/components/auth/icons";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const getEmail = () => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("pendingEmail") || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/user/verify-otp", { email: getEmail(), otp });
      router.push("/home");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setInfo("");
    try {
      await api.post("/api/user/resend-otp", { email: getEmail() });
      setInfo("A new code has been sent to your email.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle={`We sent a 6-digit code to${getEmail() ? ` ${getEmail()}` : " your email"}.`}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <OtpInput value={otp} onChange={setOtp} length={6} error={!!error} autoFocus />

        {error && <AlertBanner>{error}</AlertBanner>}
        {info && <AlertBanner tone="success">{info}</AlertBanner>}

        <AuthSubmitButton loading={loading} loadingText="Verifying...">
          Verify email
        </AuthSubmitButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Didn&apos;t receive a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="font-semibold text-primary hover:underline disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </p>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <MailIcon className="h-3.5 w-3.5" />
          Check your spam folder if it doesn&apos;t arrive.
        </p>
      </div>
    </AuthShell>
  );
}
