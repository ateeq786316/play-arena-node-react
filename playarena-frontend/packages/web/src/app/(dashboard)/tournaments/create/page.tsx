"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@playarena/shared/api";
import type { Ground, SportCategory, TournamentFormat } from "@playarena/shared/types";
import {
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
  useToast,
} from "@/components/ui";

const formatOptions: { value: TournamentFormat; label: string }[] = [
  { value: "knockout", label: "Knockout" },
  { value: "round_robin", label: "Round Robin" },
  { value: "group_knockout", label: "Group + Knockout" },
];

interface FormErrors {
  name?: string;
  sport?: string;
  format?: string;
  maxTeams?: string;
  minTeams?: string;
}

export default function CreateTournamentPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [format, setFormat] = useState<TournamentFormat>("knockout");
  const [maxTeams, setMaxTeams] = useState("16");
  const [minTeams, setMinTeams] = useState("4");
  const [registrationStarts, setRegistrationStarts] = useState("");
  const [registrationEnds, setRegistrationEnds] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [groundId, setGroundId] = useState("");
  const [categories, setCategories] = useState<SportCategory[]>([]);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [sportsLoading, setSportsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get<{ categories: SportCategory[] }>("/api/teams/sports").catch(() => ({ categories: [] })),
      api.get<{ grounds: Ground[] }>("/api/grounds").catch(() => ({ grounds: [] })),
    ])
      .then(([sportsRes, groundsRes]) => {
        setCategories(sportsRes.categories);
        setGrounds(groundsRes.grounds);
        if (sportsRes.categories.length > 0) setSport(sportsRes.categories[0].name);
      })
      .finally(() => setSportsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Tournament name is required";
    if (!sport.trim()) nextErrors.sport = "Sport is required";
    if (!Number.isInteger(Number(maxTeams)) || Number(maxTeams) < 4) nextErrors.maxTeams = "Must be at least 4";
    if (!Number.isInteger(Number(minTeams)) || Number(minTeams) < 2) nextErrors.minTeams = "Must be at least 2";
    if (Number(minTeams) > Number(maxTeams)) nextErrors.minTeams = "Cannot exceed max teams";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body: Record<string, unknown> = {
      name: name.trim(),
      sport: sport.trim(),
      format,
      maxTeams: Number(maxTeams),
      minTeams: Number(minTeams),
    };
    if (groundId) body.groundId = groundId;
    if (registrationStarts) body.registrationStarts = registrationStarts;
    if (registrationEnds) body.registrationEnds = registrationEnds;
    if (startDate) body.startDate = startDate;
    if (endDate) body.endDate = endDate;
    if (description.trim()) body.description = description.trim();

    setSubmitting(true);
    try {
      const res = await api.post<{ tournament: { id: string } }>("/api/tournaments", body);
      toast("Tournament created", "success");
      router.push(`/tournaments/${res.tournament.id}`);
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Failed to create tournament" : "Something went wrong", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "Tournaments", href: "/tournaments" },
          { label: "Create Tournament" },
        ]}
      />
      <PageHeader title="Create Tournament" description="Set up a new tournament and start accepting registrations." />

      <Card>
        <CardContent className="p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Tournament Name"
              placeholder="e.g. Summer Football Cup"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              {sportsLoading ? (
                <div>
                  <div className="mb-1.5 block text-sm font-medium text-foreground">Sport</div>
                  <Skeleton className="h-12 w-full sm:h-[52px]" />
                </div>
              ) : categories.length > 0 ? (
                <Select
                  label="Sport"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  error={errors.sport}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  label="Sport"
                  placeholder="e.g. Football"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  error={errors.sport}
                  required
                />
              )}
              <Select
                label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value as TournamentFormat)}
                error={errors.format}
                required
              >
                {formatOptions.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Max Teams"
                type="number"
                min={4}
                value={maxTeams}
                onChange={(e) => setMaxTeams(e.target.value)}
                error={errors.maxTeams}
              />
              <Input
                label="Min Teams"
                type="number"
                min={2}
                value={minTeams}
                onChange={(e) => setMinTeams(e.target.value)}
                error={errors.minTeams}
                hint="Minimum teams required to generate a bracket"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Registration Start"
                type="date"
                value={registrationStarts}
                onChange={(e) => setRegistrationStarts(e.target.value)}
              />
              <Input
                label="Registration End"
                type="date"
                value={registrationEnds}
                onChange={(e) => setRegistrationEnds(e.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Input label="Tournament Start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input label="Tournament End" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            {grounds.length > 0 && (
              <Select label="Ground (optional)" value={groundId} onChange={(e) => setGroundId(e.target.value)}>
                <option value="">No ground</option>
                {grounds.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </Select>
            )}

            <Textarea
              label="Description"
              placeholder="Rules, prizes, or other details for participants."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-end">
              <Button type="submit" loading={submitting}>
                Create Tournament
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
