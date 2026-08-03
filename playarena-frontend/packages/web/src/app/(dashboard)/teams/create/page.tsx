"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@playarena/shared/api";
import type { SportCategory, City } from "@playarena/shared/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useToast } from "@/components/ui/Toaster";

interface RegionWithCities {
  id: string;
  name: string;
  code: string;
  cities: City[];
}

export default function CreateTeamPage() {
  const router = useRouter();
  const toast = useToast();
  const [sports, setSports] = useState<SportCategory[]>([]);
  const [regions, setRegions] = useState<RegionWithCities[]>([]);
  const [name, setName] = useState("");
  const [sport, setSport] = useState("");
  const [cityId, setCityId] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState("");
  const [sportError, setSportError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ categories: SportCategory[] }>("/api/teams/sports")
      .then((res) => setSports(res.categories))
      .catch(() => {});
    api
      .get<{ regions: RegionWithCities[] }>("/api/grounds/regions")
      .then((res) => setRegions(res.regions))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(name.trim() ? "" : "Team name is required");
    setSportError(sport ? "" : "Please select a sport");
    setSubmitError("");
    if (!name.trim() || !sport) return;
    setLoading(true);
    try {
      const res = await api.post<{ team: { id: string } }>("/api/teams", {
        name: name.trim(),
        sport,
        cityId: cityId || undefined,
        description: description.trim() || undefined,
      });
      toast("Team created successfully", "success");
      router.push(`/teams/${res.team.id}`);
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError && err.body?.message ? err.body.message : "Failed to create team";
      setSubmitError(msg);
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "Teams", href: "/teams" },
          { label: "Create Team" },
        ]}
      />
      <PageHeader title="Create Team" description="Set up a new team and start competing" />

      <Card className="max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Team Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={nameError}
            placeholder="e.g. Lahore United"
          />
          <Select label="Sport *" value={sport} onChange={(e) => setSport(e.target.value)} error={sportError}>
            <option value="">Select a sport</option>
            {sports.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
            {sports.length === 0 && (
              <option value="" disabled>
                Loading sports...
              </option>
            )}
          </Select>
          {regions.length > 0 && (
            <Select label="City (optional)" value={cityId} onChange={(e) => setCityId(e.target.value)}>
              <option value="">Select a city</option>
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell players what this team is about..."
          />
          {submitError && <p className="text-sm text-danger">{submitError}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.push("/teams")}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
