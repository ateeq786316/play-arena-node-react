"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Pencil,
  UserPlus,
  LogOut,
  MoreHorizontal,
  Crown,
  Shield,
  Trash2,
  Users,
  Trophy,
  CalendarDays,
  Check,
  X,
  Send,
  Loader2,
} from "lucide-react";
import { api, ApiError } from "@playarena/shared/api";
import type { Team, TeamMember, TeamRole, MatchRequest, JoinRequest, SportCategory, City, User } from "@playarena/shared/types";
import { formatDate, formatRelativeTime } from "@playarena/shared/utils";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatCard } from "@/components/ui/StatCard";
import { Tabs } from "@/components/ui/Tabs";
import type { TabItem } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { DropdownMenu, DropdownItem } from "@/components/ui/DropdownMenu";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/ui/Toaster";

interface TeamDetail extends Team {
  _count?: { members: number };
}

interface JoinRequestWithUser extends JoinRequest {
  user?: User;
}

interface TeamStats {
  totalMembers: number;
  elo: number;
}

interface RatingHistory {
  id: string;
  teamId: string;
  eloBefore: number;
  eloAfter: number;
  reason: string;
  matchId: string | null;
  createdAt: string;
}

interface MatchRequestWithTeam extends MatchRequest {
  challenger?: { id: string; name: string };
  opponent?: { id: string; name: string };
}

interface RegionWithCities {
  id: string;
  name: string;
  code: string;
  cities: City[];
}

const formatRole = (role: TeamRole): string =>
  role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const roleBadge: Record<TeamRole, "default" | "success" | "info" | "outline"> = {
  captain: "default",
  co_captain: "info",
  player: "outline",
};

const roleOrder: Record<TeamRole, number> = { captain: 0, co_captain: 1, player: 2 };

const matchStatusBadge: Record<string, "warning" | "success" | "danger" | "outline" | "default"> = {
  pending: "warning",
  accepted: "success",
  rejected: "danger",
  cancelled: "outline",
  expired: "default",
};

function ChallengeRow({
  challenge,
  side,
  busy,
  canManage,
  onAction,
}: {
  challenge: MatchRequestWithTeam;
  side: "received" | "sent";
  busy: boolean;
  canManage: boolean;
  onAction: (challenge: MatchRequestWithTeam, action: "accept" | "reject" | "cancel") => void;
}) {
  const teamName = side === "received" ? challenge.challenger?.name : challenge.opponent?.name;
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={teamName} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{teamName || "Unknown team"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {side === "received" ? "Challenged your team" : "Sent by you"}
            {challenge.proposedDate ? ` · ${formatDate(challenge.proposedDate)}` : ""}
          </p>
          {challenge.message && <p className="mt-0.5 truncate text-xs text-muted-foreground">{challenge.message}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={matchStatusBadge[challenge.status] ?? "default"}>
          {challenge.status.replace(/_/g, " ")}
        </Badge>
        {canManage && challenge.status === "pending" &&
          (side === "received" ? (
            <>
              <Button size="sm" icon={<Check className="h-4 w-4" />} loading={busy} onClick={() => onAction(challenge, "accept")}>
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<X className="h-4 w-4" />}
                disabled={busy}
                onClick={() => onAction(challenge, "reject")}
              >
                Decline
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              variant="outline"
              icon={<X className="h-4 w-4" />}
              loading={busy}
              onClick={() => onAction(challenge, "cancel")}
            >
              Cancel
            </Button>
          ))}
      </div>
    </div>
  );
}

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.user);

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [joinRequests, setJoinRequests] = useState<JoinRequestWithUser[]>([]);
  const [stats, setStats] = useState<TeamStats | null>(null);
  const [ratingHistory, setRatingHistory] = useState<RatingHistory[]>([]);
  const [sports, setSports] = useState<SportCategory[]>([]);
  const [regions, setRegions] = useState<RegionWithCities[]>([]);
  const [sentChallenges, setSentChallenges] = useState<MatchRequestWithTeam[]>([]);
  const [receivedChallenges, setReceivedChallenges] = useState<MatchRequestWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", sport: "", cityId: "", description: "" });
  const [editErrors, setEditErrors] = useState<{ name?: string; sport?: string }>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteUserId, setInviteUserId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const [memberBusy, setMemberBusy] = useState<{ userId: string; action: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);
  const [transferTarget, setTransferTarget] = useState<TeamMember | null>(null);
  const [transferring, setTransferring] = useState(false);

  const [requestBusy, setRequestBusy] = useState<string | null>(null);
  const [challengeBusy, setChallengeBusy] = useState<string | null>(null);

  const currentMember = members.find((m) => m.userId === currentUser?.id);
  const isCaptain = currentMember?.role === "captain";
  const isCoCaptain = currentMember?.role === "co_captain";
  const canManage = isCaptain || isCoCaptain;
  const memberCount = stats?.totalMembers ?? team?._count?.members ?? members.length;

  const fetchAll = useCallback(() => {
    Promise.all([
      api.get<{ team: TeamDetail }>(`/api/teams/${id}`),
      api.get<{ members: TeamMember[] }>(`/api/teams/${id}/members`).catch(() => ({ members: [] })),
      api.get<{ stats: TeamStats }>(`/api/teams/${id}/stats`).catch(() => ({ stats: null })),
      api.get<{ requests: JoinRequestWithUser[] }>(`/api/teams/${id}/join-requests`).catch(() => ({ requests: [] })),
      api.get<{ history: RatingHistory[] }>(`/api/teams/${id}/rating-history`).catch(() => ({ history: [] })),
      api.get<{ categories: SportCategory[] }>("/api/teams/sports").catch(() => ({ categories: [] })),
      api.get<{ regions: RegionWithCities[] }>("/api/grounds/regions").catch(() => ({ regions: [] })),
      api.get<{ challenges: MatchRequestWithTeam[] }>(`/api/matches/requests/sent/${id}`).catch(() => ({ challenges: [] })),
      api.get<{ challenges: MatchRequestWithTeam[] }>(`/api/matches/requests/received/${id}`).catch(() => ({ challenges: [] })),
    ])
      .then(([teamRes, membersRes, statsRes, requestsRes, historyRes, sportsRes, regionsRes, sentRes, receivedRes]) => {
        setTeam(teamRes.team);
        setMembers(membersRes.members.length > 0 ? membersRes.members : teamRes.team.members ?? []);
        setStats(statsRes.stats);
        setJoinRequests(requestsRes.requests);
        setRatingHistory(historyRes.history);
        setSports(sportsRes.categories);
        setRegions(regionsRes.regions);
        setSentChallenges(sentRes.challenges);
        setReceivedChallenges(receivedRes.challenges);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.body.message || "Failed to load team" : "Failed to load team");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const reload = useCallback(() => {
    Promise.all([
      api.get<{ team: TeamDetail }>(`/api/teams/${id}`),
      api.get<{ members: TeamMember[] }>(`/api/teams/${id}/members`).catch(() => ({ members: [] })),
      api.get<{ stats: TeamStats }>(`/api/teams/${id}/stats`).catch(() => ({ stats: null })),
    ])
      .then(([teamRes, membersRes, statsRes]) => {
        setTeam(teamRes.team);
        setMembers(membersRes.members.length > 0 ? membersRes.members : teamRes.team.members ?? []);
        setStats(statsRes.stats);
      })
      .catch(() => {});
  }, [id]);

  const reloadRequests = useCallback(() => {
    api
      .get<{ requests: JoinRequestWithUser[] }>(`/api/teams/${id}/join-requests`)
      .then((res) => setJoinRequests(res.requests))
      .catch(() => {});
  }, [id]);

  const reloadChallenges = useCallback(() => {
    Promise.all([
      api.get<{ challenges: MatchRequestWithTeam[] }>(`/api/matches/requests/sent/${id}`).catch(() => ({ challenges: [] })),
      api.get<{ challenges: MatchRequestWithTeam[] }>(`/api/matches/requests/received/${id}`).catch(() => ({ challenges: [] })),
    ])
      .then(([sentRes, receivedRes]) => {
        setSentChallenges(sentRes.challenges);
        setReceivedChallenges(receivedRes.challenges);
      })
      .catch(() => {});
  }, [id]);

  const openEdit = () => {
    if (!team) return;
    setEditForm({ name: team.name, sport: team.sport, cityId: team.cityId ?? "", description: team.description ?? "" });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    const errs: { name?: string; sport?: string } = {};
    if (!editForm.name.trim()) errs.name = "Team name is required";
    if (!editForm.sport) errs.sport = "Please select a sport";
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;
    const payload: Record<string, string> = { name: editForm.name.trim(), sport: editForm.sport };
    if (regions.length > 0) payload.cityId = editForm.cityId;
    if (editForm.description.trim()) payload.description = editForm.description.trim();
    setSavingEdit(true);
    try {
      await api.patch(`/api/teams/${id}`, payload);
      toast("Team updated", "success");
      setEditOpen(false);
      reload();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to update team", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleInvite = async () => {
    setInviteError("");
    if (!inviteUserId.trim()) {
      setInviteError("User ID is required");
      return;
    }
    setSendingInvite(true);
    try {
      await api.post(`/api/teams/${id}/invite`, { targetUserId: inviteUserId.trim() });
      toast("Invite sent", "success");
      setInviteOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof ApiError && err.body?.message ? err.body.message : "Failed to send invite";
      setInviteError(msg);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await api.delete(`/api/teams/${id}/members/me`);
      toast("You left the team", "success");
      router.push("/teams");
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to leave team", "error");
      setLeaveOpen(false);
    } finally {
      setLeaving(false);
    }
  };

  const handlePromote = async (member: TeamMember) => {
    setMemberBusy({ userId: member.userId, action: "promote" });
    try {
      await api.patch(`/api/teams/${id}/members/${member.userId}`, { role: "co_captain" });
      toast(`${member.user?.name || "Member"} promoted to co-captain`, "success");
      reload();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to update role", "error");
    } finally {
      setMemberBusy(null);
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget) return;
    setTransferring(true);
    try {
      await api.patch(`/api/teams/${id}/transfer-captaincy/${transferTarget.userId}`);
      toast("Captaincy transferred", "success");
      setTransferTarget(null);
      reload();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to transfer captaincy", "error");
    } finally {
      setTransferring(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await api.delete(`/api/teams/${id}/members/${removeTarget.userId}`);
      toast(`${removeTarget.user?.name || "Member"} removed from team`, "success");
      setRemoveTarget(null);
      reload();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to remove member", "error");
    } finally {
      setRemoving(false);
    }
  };

  const handleJoinRequest = async (request: JoinRequestWithUser, action: "accept" | "reject") => {
    setRequestBusy(request.userId);
    try {
      if (action === "accept") {
        await api.post(`/api/teams/${id}/join-requests/${request.userId}/accept`);
        toast(`${request.user?.name || "Player"} joined the team`, "success");
        reload();
      } else {
        await api.post(`/api/teams/${id}/join-requests/${request.userId}/reject`);
        toast("Join request rejected", "success");
      }
      reloadRequests();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to process request", "error");
    } finally {
      setRequestBusy(null);
    }
  };

  const handleChallenge = async (challenge: MatchRequestWithTeam, action: "accept" | "reject" | "cancel") => {
    setChallengeBusy(challenge.id);
    try {
      await api.patch(`/api/matches/requests/${challenge.id}/${action}`);
      toast(
        action === "accept"
          ? "Challenge accepted, match scheduled"
          : action === "reject"
            ? "Challenge rejected"
            : "Challenge cancelled",
        "success",
      );
      reloadChallenges();
    } catch (err: unknown) {
      toast(err instanceof ApiError && err.body?.message ? err.body.message : "Failed to update challenge", "error");
    } finally {
      setChallengeBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-64" />
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/home" },
            { label: "Teams", href: "/teams" },
          ]}
        />
        <Card className="p-10 text-center">
          <p className="text-sm text-danger">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setError("");
              setLoading(true);
              fetchAll();
            }}
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  if (!team) return null;

  const sortedMembers = [...members].sort(
    (a, b) => (roleOrder[a.role] ?? 3) - (roleOrder[b.role] ?? 3) || a.joinedAt.localeCompare(b.joinedAt),
  );

  const tabItems: TabItem[] = [
    { value: "roster", label: "Roster" },
    ...(canManage ? [{ value: "requests", label: `Join Requests${joinRequests.length > 0 ? ` (${joinRequests.length})` : ""}` }] : []),
    { value: "stats", label: "Stats" },
    { value: "challenges", label: "Challenges" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "Teams", href: "/teams" },
          { label: team.name },
        ]}
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={team.name} src={team.logo} size="xl" />
            <div className="min-w-0">
              <h1 className="font-heading text-4xl leading-none">{team.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Badge variant="primary-light">{team.sport}</Badge>
                <Badge variant="outline">ELO {team.elo}</Badge>
                <Badge variant="default">
                  {memberCount} member{memberCount === 1 ? "" : "s"}
                </Badge>
              </div>
              {team.description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{team.description}</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canManage && (
              <>
                <Button variant="outline" size="sm" icon={<Pencil className="h-4 w-4" />} onClick={openEdit}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<UserPlus className="h-4 w-4" />}
                  onClick={() => {
                    setInviteError("");
                    setInviteOpen(true);
                  }}
                >
                  Invite Player
                </Button>
              </>
            )}
            {currentMember && !isCaptain && (
              <Button variant="danger" size="sm" icon={<LogOut className="h-4 w-4" />} onClick={() => setLeaveOpen(true)}>
                Leave Team
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs items={tabItems} defaultValue="roster">
        {(active) => (
          <>
            {active === "roster" && (
              <div className="space-y-2">
                {sortedMembers.length === 0 ? (
                  <EmptyState
                    icon={<Users className="h-7 w-7" />}
                    title="No members"
                    description="This team has no members yet."
                  />
                ) : (
                  sortedMembers.map((member) => {
                    const isSelf = member.userId === currentUser?.id;
                    const busy = memberBusy?.userId === member.userId;
                    return (
                      <div key={member.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={member.user?.name ?? undefined} src={member.user?.avatar} size="sm" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {member.user?.name || "Unknown player"}
                              {isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
                            </p>
                            {member.user?.email && <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={roleBadge[member.role]}>{formatRole(member.role)}</Badge>
                          {canManage && !isSelf &&
                            (busy ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <DropdownMenu
                                trigger={
                                  <Button variant="ghost" size="icon" type="button" aria-label="Member actions">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                }
                              >
                                {(close) => (
                                  <>
                                    {member.role === "player" && (
                                      <DropdownItem onSelect={() => { close(); handlePromote(member); }}>
                                        <Shield className="h-4 w-4 text-muted-foreground" /> Promote to Co-Captain
                                      </DropdownItem>
                                    )}
                                    {member.role === "co_captain" && isCaptain && (
                                      <DropdownItem onSelect={() => { close(); setTransferTarget(member); }}>
                                        <Crown className="h-4 w-4 text-muted-foreground" /> Transfer Captaincy
                                      </DropdownItem>
                                    )}
                                    <DropdownItem className="text-danger" onSelect={() => { close(); setRemoveTarget(member); }}>
                                      <Trash2 className="h-4 w-4" /> Remove Member
                                    </DropdownItem>
                                  </>
                                )}
                              </DropdownMenu>
                            ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {active === "requests" && (
              <div className="space-y-2">
                {joinRequests.length === 0 ? (
                  <EmptyState
                    icon={<UserPlus className="h-7 w-7" />}
                    title="No pending requests"
                    description="Players who request to join your team will appear here."
                  />
                ) : (
                  joinRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={request.user?.name ?? undefined} src={request.user?.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{request.user?.name || "Unknown player"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {request.user?.email ? `${request.user.email} · ` : ""}requested {formatRelativeTime(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          icon={<Check className="h-4 w-4" />}
                          loading={requestBusy === request.userId}
                          onClick={() => handleJoinRequest(request, "accept")}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<X className="h-4 w-4" />}
                          disabled={requestBusy === request.userId}
                          onClick={() => handleJoinRequest(request, "reject")}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {active === "stats" && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard label="ELO Rating" value={stats?.elo ?? team.elo} icon={<Trophy className="h-4 w-4" />} accent="success" />
                  <StatCard label="Members" value={memberCount} icon={<Users className="h-4 w-4" />} />
                  <StatCard label="Created" value={formatDate(team.createdAt)} icon={<CalendarDays className="h-4 w-4" />} />
                </div>
                <Card>
                  <CardHeader>
                    <CardTitle>Rating History</CardTitle>
                    <CardDescription>Recent changes to this team&apos;s ELO rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ratingHistory.length === 0 ? (
                      <EmptyState
                        icon={<Trophy className="h-7 w-7" />}
                        title="No rating changes yet"
                        description="Rating changes will appear here once matches are completed."
                      />
                    ) : (
                      <div className="space-y-2">
                        {ratingHistory.map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{entry.reason}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
                            </div>
                            <Badge variant={entry.eloAfter >= entry.eloBefore ? "success" : "danger"}>
                              {entry.eloBefore} → {entry.eloAfter}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {active === "challenges" && (
              <div className="space-y-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Incoming Challenges</h3>
                  {receivedChallenges.length === 0 ? (
                    <EmptyState
                      icon={<Send className="h-7 w-7" />}
                      title="No incoming challenges"
                      description="Challenges from other teams will appear here."
                    />
                  ) : (
                    <div className="space-y-2">
                      {receivedChallenges.map((challenge) => (
                        <ChallengeRow
                          key={challenge.id}
                          challenge={challenge}
                          side="received"
                          busy={challengeBusy === challenge.id}
                          canManage={canManage}
                          onAction={handleChallenge}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Outgoing Challenges</h3>
                  {sentChallenges.length === 0 ? (
                    <EmptyState
                      icon={<Send className="h-7 w-7" />}
                      title="No outgoing challenges"
                      description="Challenges you have sent to other teams will appear here."
                    />
                  ) : (
                    <div className="space-y-2">
                      {sentChallenges.map((challenge) => (
                        <ChallengeRow
                          key={challenge.id}
                          challenge={challenge}
                          side="sent"
                          busy={challengeBusy === challenge.id}
                          canManage={canManage}
                          onAction={handleChallenge}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </Tabs>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Team"
        description="Update your team&apos;s details"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={savingEdit}>
              Cancel
            </Button>
            <Button loading={savingEdit} onClick={handleSaveEdit}>
              {savingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Team Name *"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            error={editErrors.name}
          />
          <Select
            label="Sport *"
            value={editForm.sport}
            onChange={(e) => setEditForm((f) => ({ ...f, sport: e.target.value }))}
            error={editErrors.sport}
          >
            <option value="">Select a sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
            {sports.length === 0 && <option value={editForm.sport}>{editForm.sport || "Loading sports..."}</option>}
          </Select>
          {regions.length > 0 && (
            <Select
              label="City"
              value={editForm.cityId}
              onChange={(e) => setEditForm((f) => ({ ...f, cityId: e.target.value }))}
            >
              <option value="">No city</option>
              {regions.map((region) => (
                <optgroup key={region.id} label={region.name}>
                  {region.cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          )}
          <Textarea
            label="Description (optional)"
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
          />
        </div>
      </Modal>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Player"
        description="Invite a player to join your team by their user ID"
        footer={
          <>
            <Button variant="outline" onClick={() => setInviteOpen(false)} disabled={sendingInvite}>
              Cancel
            </Button>
            <Button loading={sendingInvite} onClick={handleInvite}>
              {sendingInvite ? "Sending..." : "Send Invite"}
            </Button>
          </>
        }
      >
        <Input
          label="User ID *"
          value={inviteUserId}
          onChange={(e) => setInviteUserId(e.target.value)}
          error={inviteError}
          placeholder="Paste the player's user ID (UUID)"
          hint="The invite can be accepted later by the invited player."
        />
      </Modal>

      <ConfirmDialog
        open={leaveOpen}
        title="Leave Team"
        description={`Are you sure you want to leave ${team.name}? You will need a new invite to rejoin.`}
        confirmLabel="Leave Team"
        variant="danger"
        loading={leaving}
        onConfirm={handleLeave}
        onCancel={() => setLeaveOpen(false)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Member"
        description={`Remove ${removeTarget?.user?.name || "this member"} from ${team.name}?`}
        confirmLabel="Remove"
        variant="danger"
        loading={removing}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />

      <ConfirmDialog
        open={!!transferTarget}
        title="Transfer Captaincy"
        description={`Make ${transferTarget?.user?.name || "this member"} the new captain? You will become a co-captain.`}
        confirmLabel="Transfer"
        loading={transferring}
        onConfirm={handleTransfer}
        onCancel={() => setTransferTarget(null)}
      />
    </div>
  );
}
