"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { api, ApiError } from "@playarena/shared/api";
import type { MatchRating, Team, TeamMatch, TeamMember, TeamRole } from "@playarena/shared/types";
import { formatDate } from "@playarena/shared/utils";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useToast } from "@/components/ui/Toaster";
import { useAuthStore } from "@/stores/auth";
import { Play, Star, Trophy, XCircle } from "lucide-react";

type MatchWithTeams = TeamMatch & {
  challenger?: { id: string; name: string; elo?: number };
  opponent?: { id: string; name: string; elo?: number };
};

const statusVariant: Record<string, "default" | "success" | "info" | "warning" | "danger"> = {
  completed: "success",
  in_progress: "info",
  scheduled: "warning",
  score_pending: "warning",
  cancelled: "danger",
};

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const toast = useToast();

  const [match, setMatch] = useState<MatchWithTeams | null>(null);
  const [myTeamIds, setMyTeamIds] = useState<string[]>([]);
  const [myRoles, setMyRoles] = useState<Record<string, TeamRole>>({});
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [scoreChallenger, setScoreChallenger] = useState("");
  const [scoreOpponent, setScoreOpponent] = useState("");
  const [myRating, setMyRating] = useState<MatchRating | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [skill, setSkill] = useState("");
  const [sportsmanship, setSportsmanship] = useState("");
  const [punctuality, setPunctuality] = useState("");
  const [reviewText, setReviewText] = useState("");

  const loadMatch = useCallback(() => {
    api
      .get<{ match: MatchWithTeams }>(`/api/matches/detail/${id}`)
      .then(async (res) => {
        setMatch(res.match);
        const teamIds = [res.match.challengerTeamId, res.match.opponentTeamId];
        const myTeamsRes = await api.get<{ teams: Team[] }>("/api/teams/my").catch(() => ({ teams: [] as Team[] }));
        setMyTeamIds(myTeamsRes.teams.map((t) => t.id));
        const memberResults = await Promise.all(
          teamIds.map((teamId) =>
            api.get<{ members: TeamMember[] }>(`/api/teams/${teamId}/members`).catch(() => ({ members: [] as TeamMember[] })),
          ),
        );
        const roles: Record<string, TeamRole> = {};
        memberResults.forEach((memberRes, i) => {
          const me = memberRes.members.find((m) => m.userId === userId);
          if (me) roles[teamIds[i]] = me.role;
        });
        setMyRoles(roles);
        setRolesLoaded(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.body.message || "Failed to load match" : "Failed to load match");
      })
      .finally(() => setLoading(false));
  }, [id, userId]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const challengerName = match?.challenger?.name ?? match?.challengerTeamId ?? "Challenger";
  const opponentName = match?.opponent?.name ?? match?.opponentTeamId ?? "Opponent";
  const isMember = match ? myTeamIds.includes(match.challengerTeamId) || myTeamIds.includes(match.opponentTeamId) : false;
  const isCaptain =
    match
      ? myRoles[match.challengerTeamId] === "captain" ||
        myRoles[match.challengerTeamId] === "co_captain" ||
        myRoles[match.opponentTeamId] === "captain" ||
        myRoles[match.opponentTeamId] === "co_captain"
      : false;

  const handleStart = async () => {
    setActing(true);
    try {
      await api.patch(`/api/matches/${id}/start`);
      toast("Match started");
      await loadMatch();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to start match" : "Failed to start match", "error");
    } finally {
      setActing(false);
    }
  };

  const handleSubmitScore = async () => {
    const sc = Number(scoreChallenger);
    const so = Number(scoreOpponent);
    if (scoreChallenger === "" || scoreOpponent === "" || Number.isNaN(sc) || Number.isNaN(so) || sc < 0 || so < 0) {
      toast("Enter valid scores for both teams", "error");
      return;
    }
    setActing(true);
    try {
      await api.patch(`/api/matches/${id}/score`, { scoreChallenger: sc, scoreOpponent: so });
      toast("Score submitted");
      setScoreOpen(false);
      setScoreChallenger("");
      setScoreOpponent("");
      await loadMatch();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to submit score" : "Failed to submit score", "error");
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async () => {
    setActing(true);
    try {
      await api.patch(`/api/matches/${id}/cancel`);
      toast("Match cancelled");
      setCancelOpen(false);
      await loadMatch();
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to cancel match" : "Failed to cancel match", "error");
    } finally {
      setActing(false);
    }
  };

  const handleSubmitRating = async () => {
    const s = Number(skill);
    const sp = Number(sportsmanship);
    const p = Number(punctuality);
    if (!skill || !sportsmanship || !punctuality || [s, sp, p].some((v) => Number.isNaN(v) || v < 1 || v > 5)) {
      toast("Ratings must be between 1 and 5", "error");
      return;
    }
    setRatingLoading(true);
    try {
      const res = await api.post<{ rating: MatchRating }>(`/api/rating/matches/${id}/rating`, {
        skillRating: s,
        sportsmanshipRating: sp,
        punctualityRating: p,
        reviewText: reviewText.trim() || undefined,
      });
      setMyRating(res.rating);
      toast("Rating submitted");
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to submit rating" : "Failed to submit rating", "error");
    } finally {
      setRatingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-danger">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setError("");
            setLoading(true);
            loadMatch();
          }}
        >
          Retry
        </Button>
      </Card>
    );
  }

  if (!match) {
    return (
      <EmptyState icon={<Trophy className="h-7 w-7" />} title="Match not found" description="This match does not exist or you do not have access to it." />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "Matches", href: "/matches" },
          { label: "Match" },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-4xl leading-none">
            {challengerName} vs {opponentName}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {match.scheduledDate ? `Scheduled ${formatDate(match.scheduledDate)}` : "Schedule TBD"}
            {match.groundId ? ` · Ground ${match.groundId.slice(0, 8)}` : ""}
          </p>
        </div>
        <Badge variant={statusVariant[match.status] ?? "default"} className="capitalize">
          {match.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center">
              <Avatar name={challengerName} size="xl" className="mx-auto" />
              <p className="mt-2 text-sm font-medium">{challengerName}</p>
              <p className="mt-1 font-heading text-5xl leading-none">{match.scoreChallenger ?? "–"}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-semibold tracking-widest text-muted-foreground">VS</span>
              {match.status === "completed" && match.scoreChallenger != null && match.scoreOpponent != null && (
                <p className="text-xs text-muted-foreground">
                  {match.scoreChallenger > match.scoreOpponent ? `${challengerName} wins` : match.scoreChallenger < match.scoreOpponent ? `${opponentName} wins` : "Draw"}
                </p>
              )}
            </div>
            <div className="flex-1 text-center">
              <Avatar name={opponentName} size="xl" className="mx-auto" />
              <p className="mt-2 text-sm font-medium">{opponentName}</p>
              <p className="mt-1 font-heading text-5xl leading-none">{match.scoreOpponent ?? "–"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isMember && (
        <div className="flex flex-wrap items-center gap-2">
          {match.status === "scheduled" && (
            <Button onClick={handleStart} loading={acting} icon={<Play className="h-4 w-4" />}>
              Start Match
            </Button>
          )}
          {(match.status === "scheduled" || match.status === "in_progress") && (
            <Button variant="outline" onClick={() => setScoreOpen(true)} disabled={acting} icon={<Trophy className="h-4 w-4" />}>
              Enter Score
            </Button>
          )}
          {match.status === "score_pending" && (
            <p className="w-full text-sm text-muted-foreground">
              A score was submitted by one side and is awaiting reconciliation before the match completes.
            </p>
          )}
          {match.status !== "completed" && match.status !== "cancelled" && (
            <Button variant="ghost" onClick={() => setCancelOpen(true)} disabled={acting} icon={<XCircle className="h-4 w-4" />}>
              Cancel Match
            </Button>
          )}
        </div>
      )}

      {match.status === "completed" && isMember && isCaptain && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Opponent</CardTitle>
            <CardDescription>Share your experience rating {opponentName}. Each rating is from 1 to 5.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myRating ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Skill</p>
                    <p className="font-heading text-2xl">{myRating.skillRating}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Sportsmanship</p>
                    <p className="font-heading text-2xl">{myRating.sportsmanshipRating}</p>
                  </div>
                  <div className="rounded-lg border border-border p-3 text-center">
                    <p className="text-xs text-muted-foreground">Punctuality</p>
                    <p className="font-heading text-2xl">{myRating.punctualityRating}</p>
                  </div>
                </div>
                {myRating.reviewText && <p className="text-sm text-muted-foreground">{myRating.reviewText}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Skill Rating" type="number" min={1} max={5} value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="1-5" />
                <Input label="Sportsmanship" type="number" min={1} max={5} value={sportsmanship} onChange={(e) => setSportsmanship(e.target.value)} placeholder="1-5" />
                <Input label="Punctuality" type="number" min={1} max={5} value={punctuality} onChange={(e) => setPunctuality(e.target.value)} placeholder="1-5" />
                <Textarea label="Review (optional)" value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} placeholder="How did the match go?" />
                <Button onClick={handleSubmitRating} loading={ratingLoading} icon={<Star className="h-4 w-4" />}>
                  Submit Rating
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {match.status === "completed" && isMember && !isCaptain && rolesLoaded && (
        <Card>
          <CardHeader>
            <CardTitle>Rate Opponent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Only captains can submit a rating for this match.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="divide-y divide-border p-0">
          <InfoRow label="Scheduled" value={match.scheduledDate ? formatDate(match.scheduledDate) : "TBD"} />
          {match.startedAt && <InfoRow label="Started" value={new Date(match.startedAt).toLocaleString()} />}
          {match.completedAt && <InfoRow label="Completed" value={new Date(match.completedAt).toLocaleString()} />}
          {match.challenger && <InfoRow label="Challenger ELO" value={match.challenger.elo ?? "–"} />}
          {match.opponent && <InfoRow label="Opponent ELO" value={match.opponent.elo ?? "–"} />}
          <InfoRow label="Ground" value={match.groundId ?? "Not set"} />
        </CardContent>
      </Card>

      <Modal
        open={scoreOpen}
        onClose={() => setScoreOpen(false)}
        title="Enter Match Score"
        description="Submit the final score for this match."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setScoreOpen(false)} disabled={acting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitScore} loading={acting}>
              Submit Score
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={`${challengerName} score`}
            type="number"
            min={0}
            value={scoreChallenger}
            onChange={(e) => setScoreChallenger(e.target.value)}
            placeholder="0"
          />
          <Input
            label={`${opponentName} score`}
            type="number"
            min={0}
            value={scoreOpponent}
            onChange={(e) => setScoreOpponent(e.target.value)}
            placeholder="0"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onCancel={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel this match?"
        description="This match will be cancelled and cannot be resumed."
        confirmLabel="Cancel Match"
        variant="danger"
        loading={acting}
      />
    </div>
  );
}
