"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Swords, Users } from "lucide-react";
import { api, ApiError } from "@playarena/shared/api";
import type { Team } from "@playarena/shared/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { CardGridSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";

interface MyTeam extends Team {
  _count?: { members: number };
  captain?: { id: string; name: string };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<MyTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTeams = useCallback(() => {
    api
      .get<{ teams: MyTeam[] }>("/api/teams/my")
      .then((res) => setTeams(res.teams))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.body.message || "Failed to load teams" : "Failed to load teams"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Teams" description="Create and manage your sports teams" />
        <CardGridSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Teams" description="Create and manage your sports teams" />
        <Card className="p-10 text-center">
          <p className="text-sm text-danger">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setError("");
              fetchTeams();
            }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Teams"
        description="Create and manage your sports teams"
        actions={
          <>
            <Link href="/matches">
              <Button variant="outline" icon={<Swords className="h-4 w-4" />}>
                Matches &amp; Challenges
              </Button>
            </Link>
            <Link href="/teams/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create Team</Button>
            </Link>
          </>
        }
      />

      {teams.length === 0 ? (
        <EmptyState
          icon={<Users className="h-7 w-7" />}
          title="No teams yet"
          description="Create your own team or accept an invite to start competing and climbing the leaderboard."
          action={
            <Link href="/teams/create">
              <Button icon={<Plus className="h-4 w-4" />}>Create Team</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="block">
              <Card className="h-full p-5 transition-colors hover:border-primary/50">
                <div className="flex items-start gap-3">
                  <Avatar name={team.name} src={team.logo} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-heading text-2xl leading-tight">{team.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="primary-light">{team.sport}</Badge>
                      <Badge variant="outline">ELO {team.elo}</Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {team._count?.members ?? 0} members
                  </span>
                  {team.captain?.name && <span className="truncate">Captain: {team.captain.name}</span>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
