"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Crown, RefreshCw, Swords, Trophy, UserPlus, Users } from "lucide-react";
import { api, ApiError } from "@playarena/shared/api";
import type {
  Team,
  Tournament,
  TournamentFormat,
  TournamentMatch,
  TournamentStatus,
  TournamentTeam,
} from "@playarena/shared/types";
import { cn, formatDate } from "@playarena/shared/utils";
import { useAuthStore } from "@/stores/auth";
import {
  Avatar,
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  ConfirmDialog,
  DataTable,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Skeleton,
  Tabs,
  useToast,
} from "@/components/ui";
import type { DataColumn } from "@/components/ui";

type RegisteredTeam = TournamentTeam & { team: { id: string; name: string; logo: string | null } };

type TournamentDetail = Tournament & {
  teams?: RegisteredTeam[];
  _count?: { teams: number; matches: number };
};

type BracketResponse =
  | TournamentMatch[]
  | { format: TournamentFormat; status: TournamentStatus; teams: RegisteredTeam[]; matches: TournamentMatch[] };

type StandingsRow = RegisteredTeam;

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

function normalizeBracket(res: BracketResponse): { teams: RegisteredTeam[]; matches: TournamentMatch[] } {
  if (Array.isArray(res)) {
    return { teams: [], matches: res };
  }
  return { teams: res.teams || [], matches: res.matches || [] };
}

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const user = useAuthStore((s) => s.user);

  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [bracket, setBracket] = useState<{ teams: RegisteredTeam[]; matches: TournamentMatch[] }>({
    teams: [],
    matches: [],
  });
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [myTeams, setMyTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [registerOpen, setRegisterOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [registering, setRegistering] = useState(false);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const [generating, setGenerating] = useState(false);

  const [resultMatch, setResultMatch] = useState<TournamentMatch | null>(null);
  const [score1, setScore1] = useState("0");
  const [score2, setScore2] = useState("0");
  const [submittingResult, setSubmittingResult] = useState(false);

  const load = useCallback(() => {
    api.get<{ tournament: TournamentDetail }>(`/api/tournaments/${id}`)
      .then((res) => {
        setTournament(res.tournament);
        return Promise.all([
          api
            .get<BracketResponse>(`/api/tournaments/${id}/bracket`)
            .then((br) => setBracket(normalizeBracket(br)))
            .catch(() => setBracket({ teams: [], matches: [] })),
          api
            .get<{ standings: StandingsRow[] }>(`/api/tournaments/${id}/standings`)
            .then((sr) => setStandings(sr.standings))
            .catch(() => setStandings([])),
          api
            .get<{ teams: Team[] }>("/api/teams/my")
            .then((tr) => setMyTeams(tr.teams))
            .catch(() => setMyTeams([])),
        ]);
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.body.message || "Failed to load tournament" : "Failed to load tournament"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setError("");
    setLoading(true);
    load();
  };

  const isOwner = !!user && tournament?.ownerId === user.id;
  const registeredTeamIds = new Set((tournament?.teams || []).map((t) => t.teamId));
  const availableTeams = myTeams.filter((t) => !registeredTeamIds.has(t.id));
  const registeredUserTeams = myTeams.filter((t) => registeredTeamIds.has(t.id));

  const teamNameById = new Map<string, string>();
  for (const t of bracket.teams) teamNameById.set(t.teamId, t.team.name);
  for (const t of tournament?.teams || []) {
    if (!teamNameById.has(t.teamId)) teamNameById.set(t.teamId, t.team.name);
  }

  const canRegister = !isOwner && tournament?.status === "registration_open";
  const canWithdraw =
    registeredUserTeams.length > 0 &&
    tournament?.status !== "completed" &&
    tournament?.status !== "cancelled";
  const canGenerateBracket =
    isOwner && bracket.matches.length === 0 && tournament?.status !== "completed" && tournament?.status !== "cancelled";
  const canScoreMatch = (m: TournamentMatch) =>
    isOwner && (m.status === "scheduled" || m.status === "in_progress") && !!m.team1Id && !!m.team2Id;

  const openRegister = () => {
    setSelectedTeamId(availableTeams[0]?.id ?? "");
    setRegisterOpen(true);
  };

  const handleRegister = async () => {
    if (!selectedTeamId) return;
    setRegistering(true);
    try {
      await api.post(`/api/tournaments/${id}/register`, { teamId: selectedTeamId });
      setRegisterOpen(false);
      toast("Team registered", "success");
      load();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to register team" : "Something went wrong", "error");
    } finally {
      setRegistering(false);
    }
  };

  const handleWithdraw = async () => {
    if (registeredUserTeams.length === 0) return;
    setWithdrawing(true);
    try {
      await api.post(`/api/tournaments/${id}/withdraw`, { teamId: registeredUserTeams[0].id });
      setWithdrawOpen(false);
      toast("Team withdrawn", "success");
      load();
    } catch (err: unknown) {
      setWithdrawOpen(false);
      toast(err instanceof ApiError ? err.body.message || "Failed to withdraw team" : "Something went wrong", "error");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleGenerateBracket = async () => {
    setGenerating(true);
    try {
      await api.post(`/api/tournaments/${id}/generate-bracket`);
      toast("Bracket generated", "success");
      load();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to generate bracket" : "Something went wrong", "error");
    } finally {
      setGenerating(false);
    }
  };

  const openResult = (m: TournamentMatch) => {
    setResultMatch(m);
    setScore1(m.score1 != null ? String(m.score1) : "0");
    setScore2(m.score2 != null ? String(m.score2) : "0");
  };

  const handleSubmitResult = async () => {
    if (!resultMatch) return;
    setSubmittingResult(true);
    try {
      await api.post(`/api/tournaments/${id}/matches/${resultMatch.id}/result`, {
        score1: Number(score1),
        score2: Number(score2),
      });
      setResultMatch(null);
      toast("Result recorded", "success");
      load();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to record result" : "Something went wrong", "error");
    } finally {
      setSubmittingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-96" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Trophy className="h-6 w-6" />}
        title="Tournament unavailable"
        description={error}
        action={
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={retry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!tournament) return null;

  const rounds = bracket.matches.reduce<Record<number, TournamentMatch[]>>((acc, m) => {
    (acc[m.round] = acc[m.round] || []).push(m);
    return acc;
  }, {});
  const roundNumbers = Object.keys(rounds)
    .map(Number)
    .sort((a, b) => a - b);

  const ranked = standings.map((row, i) => ({ ...row, rank: i + 1 }));

  const standingsColumns: DataColumn<StandingsRow & { rank: number }>[] = [
    { key: "rank", header: "#" },
    {
      key: "team",
      header: "Team",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Avatar name={row.team.name} src={row.team.logo} size="sm" />
          <span className="font-medium">{row.team.name}</span>
        </div>
      ),
    },
    { key: "played", header: "P" },
    { key: "won", header: "W" },
    { key: "drawn", header: "D" },
    { key: "lost", header: "L" },
    { key: "goalsFor", header: "GF" },
    { key: "goalsAgainst", header: "GA" },
    { key: "gd", header: "GD", render: (row) => row.goalsFor - row.goalsAgainst },
    { key: "points", header: "Pts", render: (row) => <span className="font-semibold">{row.points}</span> },
  ];

  const registeredTeams = tournament.teams || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "Tournaments", href: "/tournaments" },
          { label: tournament.name },
        ]}
      />

      <PageHeader
        title={tournament.name}
        description={tournament.description || "Tournament details, bracket and standings."}
        actions={
          <>
            <Badge variant={statusBadgeVariant[tournament.status]}>{tournament.status.replace(/_/g, " ")}</Badge>
            {isOwner && (
              <Badge variant="warning" className="gap-1">
                <Crown className="h-3 w-3" /> Organizer
              </Badge>
            )}
            {registeredUserTeams.length > 0 && <Badge variant="success">You&apos;re in</Badge>}
            {canRegister && (
              <Button size="sm" icon={<UserPlus className="h-4 w-4" />} onClick={openRegister}>
                Register Team
              </Button>
            )}
            {canWithdraw && (
              <Button size="sm" variant="outline" onClick={() => setWithdrawOpen(true)}>
                Withdraw
              </Button>
            )}
            {canGenerateBracket && (
              <Button size="sm" variant="accent" icon={<Swords className="h-4 w-4" />} loading={generating} onClick={handleGenerateBracket}>
                Generate Bracket
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{tournament.sport}</Badge>
            <Badge variant="outline">{formatLabel[tournament.format]}</Badge>
            <Badge variant="primary-light">
              {tournament._count?.teams ?? 0} / {tournament.maxTeams} teams
            </Badge>
          </div>
          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Registration</p>
              <p className="font-medium">
                {tournament.registrationStarts ? formatDate(tournament.registrationStarts) : "Open"}
                {tournament.registrationEnds ? ` – ${formatDate(tournament.registrationEnds)}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tournament Dates</p>
              <p className="font-medium">
                {tournament.startDate ? formatDate(tournament.startDate) : "TBD"}
                {tournament.endDate ? ` – ${formatDate(tournament.endDate)}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Format</p>
              <p className="font-medium">{formatLabel[tournament.format]}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        items={[
          { value: "bracket", label: "Bracket" },
          { value: "standings", label: "Standings" },
          { value: "teams", label: "Teams" },
        ]}
        defaultValue="bracket"
      >
        {(active) => {
          if (active === "standings") {
            return (
              <DataTable
                columns={standingsColumns}
                rows={ranked}
                keyField="id"
                emptyTitle="No standings yet"
                emptyState="Standings will appear once matches have results recorded."
              />
            );
          }

          if (active === "teams") {
            if (registeredTeams.length === 0) {
              return (
                <EmptyState
                  icon={<Users className="h-6 w-6" />}
                  title="No teams registered yet"
                  description="Registrations will show up here as teams join the tournament."
                />
              );
            }
            return (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {registeredTeams.map((t) => (
                  <Card key={t.teamId}>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Avatar name={t.team.name} src={t.team.logo} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{t.team.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.group ? `Group ${t.group}` : "Registered"}
                          {t.seed != null ? ` · Seed ${t.seed}` : ""}
                        </p>
                      </div>
                      <Badge variant="outline">{t.points} pts</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          }

          if (bracket.matches.length === 0) {
            return (
              <EmptyState
                icon={<Swords className="h-6 w-6" />}
                title="Bracket not generated yet"
                description={
                  isOwner
                    ? "Generate the bracket once enough teams have registered."
                    : "The organizer hasn't generated the bracket yet."
                }
              />
            );
          }

          return (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {roundNumbers.map((round) => (
                <div key={round} className="min-w-[240px] flex-1">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Round {round}</h3>
                  <div className="space-y-3">
                    {rounds[round].map((m) => {
                      const team1 = teamNameById.get(m.team1Id ?? "") ?? "TBD";
                      const team2 = teamNameById.get(m.team2Id ?? "") ?? "TBD";
                      const team1Won = m.winnerId != null && m.winnerId === m.team1Id;
                      const team2Won = m.winnerId != null && m.winnerId === m.team2Id;
                      return (
                        <Card key={m.id}>
                          <CardContent className="p-3">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("truncate text-sm", team1Won ? "font-semibold text-primary" : "text-foreground")}>
                                  {team1}
                                </span>
                                <span className="text-sm font-medium">{m.score1 ?? "—"}</span>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn("truncate text-sm", team2Won ? "font-semibold text-primary" : "text-foreground")}>
                                  {team2}
                                </span>
                                <span className="text-sm font-medium">{m.score2 ?? "—"}</span>
                              </div>
                            </div>
                            {canScoreMatch(m) && (
                              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => openResult(m)}>
                                Enter Result
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        }}
      </Tabs>

      <Modal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
        title="Register a team"
        description="Pick one of your teams to enter this tournament."
        footer={
          <>
            <Button variant="ghost" onClick={() => setRegisterOpen(false)} disabled={registering}>
              Cancel
            </Button>
            <Button loading={registering} disabled={!selectedTeamId} onClick={handleRegister}>
              Register
            </Button>
          </>
        }
      >
        {availableTeams.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No teams available"
            description="You don't have any teams that aren't already in this tournament."
            action={
              <Link href="/teams/create">
                <Button size="sm">Create a Team</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-2">
            {availableTeams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition-colors",
                  selectedTeamId === team.id ? "border-primary bg-primary-light/40" : "border-border hover:border-primary/40",
                )}
              >
                <Avatar name={team.name} src={team.logo} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{team.name}</p>
                  <p className="text-xs text-muted-foreground">{team.sport}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={withdrawOpen}
        title="Withdraw team?"
        description={`${registeredUserTeams[0]?.name ?? "This team"} will be removed from this tournament.`}
        confirmLabel="Withdraw"
        variant="danger"
        loading={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => setWithdrawOpen(false)}
      />

      <Modal
        open={resultMatch !== null}
        onClose={() => setResultMatch(null)}
        title="Enter match result"
        description="Record the final scores for this match."
        footer={
          <>
            <Button variant="ghost" onClick={() => setResultMatch(null)} disabled={submittingResult}>
              Cancel
            </Button>
            <Button loading={submittingResult} onClick={handleSubmitResult}>
              Save Result
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={teamNameById.get(resultMatch?.team1Id ?? "") ?? "Team 1"}
            type="number"
            min={0}
            value={score1}
            onChange={(e) => setScore1(e.target.value)}
          />
          <Input
            label={teamNameById.get(resultMatch?.team2Id ?? "") ?? "Team 2"}
            type="number"
            min={0}
            value={score2}
            onChange={(e) => setScore2(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
}
