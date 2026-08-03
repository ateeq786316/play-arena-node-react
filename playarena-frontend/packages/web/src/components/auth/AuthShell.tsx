import type { ReactNode } from "react";
import { AuthLogo } from "./AuthLogo";
import { CalendarIcon, MapPinIcon, ShieldCheckIcon, TrophyIcon, UsersIcon } from "./icons";

const benefits = [
  { icon: MapPinIcon, title: "Find grounds near you", desc: "Browse courts across the city" },
  { icon: CalendarIcon, title: "Book in seconds", desc: "Reserve slots anytime, anywhere" },
  { icon: UsersIcon, title: "Team up & play", desc: "Create teams and challenge rivals" },
  { icon: TrophyIcon, title: "Compete & climb", desc: "Join tournaments, win matches" },
];

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 lg:block lg:w-[44%] xl:w-[42%]">
        <div className="auth-panel-grid absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-slate-700/30 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-slate-600/20 blur-3xl" aria-hidden="true" />
        <div
          className="pointer-events-none absolute right-10 top-16 h-44 w-44 rotate-12 rounded-[2rem] border border-slate-600/30"
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute right-24 top-36 h-6 w-6 rounded-full bg-slate-500/40" aria-hidden="true" />
        <div
          className="pointer-events-none absolute bottom-24 right-24 h-28 w-28 rounded-full border-2 border-dashed border-slate-600/30"
          aria-hidden="true"
        />

        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
          <AuthLogo tone="light" />

          <div className="my-auto max-w-md py-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-600/30 bg-slate-700/30 px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-300">
              <TrophyIcon className="h-3.5 w-3.5" />
              Book · Play · Compete
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Every court.
              <br />
              One arena.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300/80">
              Reserve sports grounds, form teams, and enter tournaments — all in one place.
            </p>

            <ul className="mt-10 space-y-5">
              {benefits.map(({ icon: Icon, title: benefitTitle, desc }) => (
                <li key={benefitTitle} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-600/25 bg-slate-700/30 text-slate-300">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{benefitTitle}</p>
                    <p className="text-sm text-slate-300/70">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="flex items-center gap-2 text-sm text-slate-300/70">
            <ShieldCheckIcon className="h-4 w-4 text-slate-400" />
            Secure sign-in · Your data stays protected
          </p>
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
        <div className="animate-auth-fade-up w-full max-w-md">
          <AuthLogo className="mb-8 lg:hidden" />
          <div className="rounded-2xl border border-border bg-background/80 p-6 shadow-sm backdrop-blur sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
            <div className="mt-7">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
