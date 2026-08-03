"use client";

import { useState, useEffect } from "react";
import { api, ApiError } from "@playarena/shared/api";
import type { SportCategory } from "@playarena/shared/types";
import { cn } from "@playarena/shared/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { DataTable, type DataColumn } from "@/components/ui/DataTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Crown, Medal, Trophy } from "lucide-react";

type LeaderboardTeam = {
  id: string;
  name: string;
  elo: number;
  sport: string;
  logo: string | null;
};

type RankedTeam = LeaderboardTeam & { rank: number };

export default function LeaderboardPage() {
  const [sports, setSports] = useState<SportCategory[]>([]);
  const [sportFilter, setSportFilter] = useState("");
  const [teams, setTeams] = useState<LeaderboardTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    api
      .get<{ categories: SportCategory[] }>("/api/teams/sports")
      .then((res) => setSports(res.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const path = sportFilter ? `/api/leaderboard/${encodeURIComponent(sportFilter)}` : "/api/leaderboard";
    api
      .get<{ teams: LeaderboardTeam[] }>(path)
      .then((res) => {
        setTeams(res.teams);
        setError("");
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.body.message || "Failed to load leaderboard" : "Failed to load leaderboard");
      })
      .finally(() => setLoading(false));
  }, [sportFilter, reloadKey]);

  const ranked: RankedTeam[] = teams.map((team, i) => ({ ...team, rank: i + 1 }));
  const top3 = ranked.slice(0, 3);

  const columns: DataColumn<RankedTeam>[] = [
    {
      key: "rank",
      header: "#",
      render: (row) => (
        <span className={cn("font-bold", row.rank <= 3 ? "text-primary" : "text-muted-foreground")}>{row.rank}</span>
      ),
    },
    {
      key: "name",
      header: "Team",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.name} src={row.logo} size="sm" />
          <span className="font-medium">{row.name}</span>
        </div>
      ),
    },
    { key: "sport", header: "Sport", render: (row) => <Badge variant="outline">{row.sport}</Badge> },
    { key: "elo", header: "ELO", render: (row) => <span className="font-semibold">{row.elo}</span> },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => setReloadKey((k) => k + 1)}>
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Leaderboard" description="Top teams ranked by ELO rating." />

      <Select label="Sport" value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="max-w-xs">
        <option value="">All Sports</option>
        {sports.map((s) => (
          <option key={s.id} value={s.name}>
            {s.name}
          </option>
        ))}
      </Select>

      {ranked.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-7 w-7" />}
          title="No teams ranked yet"
          description="Start playing matches to appear on the leaderboard."
        />
      ) : (
        <>
          {top3.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-3">
              {top3.map((t, i) => (
                <StatCard
                  key={t.id}
                  label={`#${t.rank} · ${t.sport}`}
                  value={t.name}
                  hint={`${t.elo} ELO`}
                  icon={
                    i === 0 ? (
                      <Crown className="h-5 w-5 text-amber-500" />
                    ) : i === 1 ? (
                      <Medal className="h-5 w-5 text-slate-400" />
                    ) : (
                      <Medal className="h-5 w-5 text-amber-700" />
                    )
                  }
                />
              ))}
            </div>
          )}

          <DataTable<RankedTeam>
            columns={columns}
            rows={ranked}
            keyField="id"
            emptyState="No teams ranked yet. Start playing matches to appear here."
          />
        </>
      )}
    </div>
  );
}
