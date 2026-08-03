"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { FormField } from "@/components/auth/FormField";
import { PasswordField } from "@/components/auth/PasswordField";
import { AuthSubmitButton } from "@/components/auth/AuthSubmitButton";
import { AlertBanner } from "@/components/auth/AlertBanner";
import { MailIcon, PhoneIcon, UserIcon } from "@/components/auth/icons";

export default function SignupPage() {
  const router = useRouter();
  const { signup, fieldErrors, clearErrors } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
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
      await signup(name, email, password, mobile);
      router.push("/verify-otp");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      if (!fieldErrors.length) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="Join PlayArena and start playing today.">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="name"
          label="Full name"
          placeholder="e.g. Ali Khan"
          autoComplete="name"
          icon={<UserIcon className="h-4 w-4" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={getError("name")}
          required
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          icon={<MailIcon className="h-4 w-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={getError("email")}
          required
        />
        <FormField
          id="mobile"
          label="Mobile number"
          type="tel"
          placeholder="+92 300 0000000"
          autoComplete="tel"
          inputMode="tel"
          icon={<PhoneIcon className="h-4 w-4" />}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          error={getError("mobile")}
          required
        />
        <PasswordField
          id="password"
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={getError("password")}
          hint="Min 8 chars with 1 uppercase, 1 number, and 1 special character"
          autoComplete="new-password"
          required
        />

        {error && <AlertBanner>{error}</AlertBanner>}

        <AuthSubmitButton loading={loading} loadingText="Creating account...">
          Create account
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
