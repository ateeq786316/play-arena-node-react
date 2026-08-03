"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, Plus, RefreshCw, Trophy } from "lucide-react";
import { api, ApiError } from "@playarena/shared/api";
import type { Tournament, TournamentFormat, TournamentStatus } from "@playarena/shared/types";
import { formatDate } from "@playarena/shared/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardGridSkeleton,
  EmptyState,
  PageHeader,
} from "@/components/ui";

type TournamentListItem = Tournament & { _count?: { teams: number } };

type StatusBadgeVariant = "success" | "info" | "warning" | "danger";

const statusBadgeVariant: Record<TournamentStatus, StatusBadgeVariant> = {
  ongoing: "success",
  completed: "success",
  registration_open: "info",
  upcoming: "warning",
  registration_closed: "warning",
  cancelled: "danger",
};

const formatLabel: Record<TournamentFormat, string> = {
  knockout: "Knockout",
  round_robin: "Round Robin",
  group_knockout: "Group + Knockout",
};

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<TournamentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api.get<{ tournaments: TournamentListItem[] }>("/api/tournaments")
      .then((res) => setTournaments(res.tournaments))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.body.message || "Failed to load tournaments" : "Failed to load tournaments"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setError("");
    setLoading(true);
    load();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tournaments"
        description="Browse tournaments and register your team."
        actions={
          <Link href="/tournaments/create">
            <Button icon={<Plus className="h-4 w-4" />}>Create Tournament</Button>
          </Link>
        }
      />

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="Couldn't load tournaments"
          description={error}
          action={
            <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={retry}>
              Retry
            </Button>
          }
        />
      ) : tournaments.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-6 w-6" />}
          title="No tournaments yet"
          description="Be the first to organize a tournament for your sport."
          action={
            <Link href="/tournaments/create">
              <Button size="sm" icon={<Plus className="h-4 w-4" />}>
                Create Tournament
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((t) => (
            <Link key={t.id} href={`/tournaments/${t.id}`} className="group block">
              <Card className="transition-colors group-hover:border-primary/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-heading text-2xl leading-none">{t.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Badge variant="outline">{t.sport}</Badge>
                        <Badge variant="outline">{formatLabel[t.format]}</Badge>
                      </div>
                    </div>
                    <Badge variant={statusBadgeVariant[t.status]}>{t.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {t._count?.teams ?? 0} / {t.maxTeams} teams registered
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {t.registrationStarts ? formatDate(t.registrationStarts) : ""}
                    {t.registrationEnds ? ` – ${formatDate(t.registrationEnds)}` : ""}
                    {t.startDate ? ` · Starts ${formatDate(t.startDate)}` : ""}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
