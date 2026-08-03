"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api, ApiError } from "@playarena/shared/api";
import type { MatchRequest, Team, TeamMatch } from "@playarena/shared/types";
import { formatDate, formatRelativeTime } from "@playarena/shared/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toaster";
import { Check, Swords, X, XCircle } from "lucide-react";

type MatchWithTeams = TeamMatch & {
  challenger?: { id: string; name: string };
  opponent?: { id: string; name: string };
};

type ChallengeWithTeam = MatchRequest & {
  challenger?: { id: string; name: string };
  opponent?: { id: string; name: string };
};

const statusVariant: Record<string, "default" | "success" | "info" | "warning" | "danger"> = {
  completed: "success",
  in_progress: "info",
  scheduled: "warning",
  score_pending: "warning",
  cancelled: "danger",
};

const requestVariant: Record<string, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  cancelled: "default",
  expired: "default",
};

function teamName(team?: { id: string; name: string }): string {
  return team?.name ?? team?.id ?? "Unknown";
}

export default function MatchesPage() {
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [sent, setSent] = useState<ChallengeWithTeam[]>([]);
  const [received, setReceived] = useState<ChallengeWithTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [teamsError, setTeamsError] = useState("");
  const [acting, setActing] = useState<{ id: string; action: string } | null>(null);

  const loadTeams = useCallback(() => {
    api
      .get<{ teams: Team[] }>("/api/teams/my")
      .then((res) => {
        setTeams(res.teams);
        setTeamsError("");
        if (res.teams.length > 0) {
          setSelectedTeamId((prev) => (prev && res.teams.some((t) => t.id === prev) ? prev : res.teams[0].id));
        }
      })
      .catch((err: unknown) => {
        setTeamsError(err instanceof ApiError ? err.body.message || "Failed to load your teams" : "Failed to load your teams");
      })
      .finally(() => setLoadingTeams(false));
  }, []);

  const loadTeamData = useCallback(
    (teamId: string) => {
      Promise.all([
        api.get<{ matches: MatchWithTeams[] }>(`/api/matches/${teamId}`),
        api.get<{ challenges: ChallengeWithTeam[] }>(`/api/matches/requests/sent/${teamId}`),
        api.get<{ challenges: ChallengeWithTeam[] }>(`/api/matches/requests/received/${teamId}`),
      ])
        .then(([matchesRes, sentRes, receivedRes]) => {
          setMatches(matchesRes.matches);
          setSent(sentRes.challenges);
          setReceived(receivedRes.challenges);
        })
        .catch((err: unknown) => {
          toast(err instanceof ApiError ? err.body.message || "Failed to load matches" : "Failed to load matches", "error");
        })
        .finally(() => setLoadingData(false));
    },
    [toast],
  );

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  useEffect(() => {
    if (selectedTeamId) loadTeamData(selectedTeamId);
  }, [selectedTeamId, loadTeamData]);

  const handleRequestAction = async (requestId: string, action: "accept" | "reject" | "cancel") => {
    setActing({ id: requestId, action });
    try {
      await api.patch(`/api/matches/requests/${requestId}/${action}`);
      toast(action === "accept" ? "Challenge accepted" : action === "reject" ? "Challenge rejected" : "Challenge cancelled");
      await loadTeamData(selectedTeamId);
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Action failed" : "Action failed", "error");
    } finally {
      setActing(null);
    }
  };

  if (loadingTeams) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (teamsError && teams.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-danger">{teamsError}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setLoadingTeams(true);
            loadTeams();
          }}
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Matches" description="Join or create a team to start playing matches." />
        <EmptyState
          icon={<Swords className="h-7 w-7" />}
          title="No teams yet"
          description="You need to be part of a team to view matches and send challenges."
          action={
            <Link href="/teams">
              <Button>Go to Teams</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const opponentOf = (match: MatchWithTeams) => {
    if (match.challengerTeamId === selectedTeamId) {
      return match.opponent ?? { id: match.opponentTeamId, name: match.opponentTeamId };
    }
    return match.challenger ?? { id: match.challengerTeamId, name: match.challengerTeamId };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Matches" description="Track your team's matches and challenges." />

      <Select
        label="Team"
        value={selectedTeamId}
        onChange={(e) => {
          setSelectedTeamId(e.target.value);
          setLoadingData(true);
        }}
      >
        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>

      <Tabs
        items={[
          { value: "matches", label: `Matches (${matches.length})` },
          { value: "challenges", label: `Challenges (${received.length + sent.length})` },
        ]}
        defaultValue="matches"
      >
        {(active) =>
          active === "challenges" ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Received Challenges</CardTitle>
                  <CardDescription>Challenge requests other teams sent to you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingData ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : received.length === 0 ? (
                    <EmptyState
                      icon={<Swords className="h-6 w-6" />}
                      title="No received challenges"
                      description="When a team challenges you, it will show up here."
                    />
                  ) : (
                    received.map((ch) => {
                      const busy = acting?.id === ch.id;
                      return (
                        <div key={ch.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                          <div>
                            <p className="font-medium">{teamName(ch.challenger)}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {ch.proposedDate ? formatDate(ch.proposedDate) : "Date TBD"} · {formatRelativeTime(ch.createdAt)}
                            </p>
                            {ch.message && <p className="mt-1 text-sm text-muted-foreground">{ch.message}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={requestVariant[ch.status] ?? "default"}>{ch.status}</Badge>
                            {ch.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  loading={busy && acting?.action === "accept"}
                                  disabled={busy}
                                  onClick={() => handleRequestAction(ch.id, "accept")}
                                  icon={<Check className="h-4 w-4" />}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  loading={busy && acting?.action === "reject"}
                                  disabled={busy}
                                  onClick={() => handleRequestAction(ch.id, "reject")}
                                  icon={<X className="h-4 w-4" />}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sent Challenges</CardTitle>
                  <CardDescription>Challenge requests your team has sent.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingData ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : sent.length === 0 ? (
                    <EmptyState
                      icon={<Swords className="h-6 w-6" />}
                      title="No sent challenges"
                      description="Challenge another team to get your first match scheduled."
                    />
                  ) : (
                    sent.map((ch) => {
                      const busy = acting?.id === ch.id;
                      return (
                        <div key={ch.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4">
                          <div>
                            <p className="font-medium">{teamName(ch.opponent)}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {ch.proposedDate ? formatDate(ch.proposedDate) : "Date TBD"} · {formatRelativeTime(ch.createdAt)}
                            </p>
                            {ch.message && <p className="mt-1 text-sm text-muted-foreground">{ch.message}</p>}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={requestVariant[ch.status] ?? "default"}>{ch.status}</Badge>
                            {ch.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                loading={busy && acting?.action === "cancel"}
                                disabled={busy}
                                onClick={() => handleRequestAction(ch.id, "cancel")}
                                icon={<XCircle className="h-4 w-4" />}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingData ? (
                [1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : matches.length === 0 ? (
                <EmptyState
                  icon={<Swords className="h-7 w-7" />}
                  title="No matches yet"
                  description="Matches appear here once a challenge is accepted."
                />
              ) : (
                matches.map((match) => {
                  const opp = opponentOf(match);
                  const played = match.scoreChallenger != null && match.scoreOpponent != null;
                  return (
                    <Link
                      key={match.id}
                      href={`/matches/${match.id}`}
                      className="block rounded-lg border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/50"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={opp.name} />
                          <div>
                            <p className="font-medium">{opp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {match.scheduledDate ? formatDate(match.scheduledDate) : "Schedule TBD"}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={statusVariant[match.status] ?? "default"}>{match.status.replace(/_/g, " ")}</Badge>
                          <p className="font-heading text-xl leading-none">
                            {played ? `${match.scoreChallenger} : ${match.scoreOpponent}` : "–"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )
        }
      </Tabs>
    </div>
  );
}
