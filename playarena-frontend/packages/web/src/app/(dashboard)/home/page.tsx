"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth";
import { api } from "@playarena/shared/api";
import type { Ground, NearbySearchResponse } from "@playarena/shared/types";
import NearMeMap from "@/components/domain/geo/NearMeMap";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardGridSkeleton,
  EmptyState,
  Input,
  PageHeader,
} from "@/components/ui";
import { AlertCircle, LocateFixed, MapPin, MapPinned, Search } from "lucide-react";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");
  const [nearby, setNearby] = useState<NearbySearchResponse | null>(null);

  const loadFeatured = useCallback(() => {
    api.get<{ grounds: Ground[] }>("/api/grounds/featured")
      .then((res) => {
        setGrounds(res.grounds);
        setError("");
      })
      .catch(() => setError("Failed to load featured grounds."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const findNearby = useCallback((lat: number, lng: number, radius = 10) => {
    setLocating(true);
    setLocError("");
    api.get<NearbySearchResponse>(`/api/geo/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`)
      .then((res) => {
        setNearby(res);
        setGrounds(res.grounds);
      })
      .catch(() => setLocError("Failed to load nearby grounds."))
      .finally(() => setLocating(false));
  }, []);

  const handleNearMe = () => {
    if (!("geolocation" in navigator)) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    setLocError("");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => findNearby(pos.coords.latitude, pos.coords.longitude),
      () => {
        setLocating(false);
        setLocError("Unable to get your location. Please allow location access.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleClearNearby = () => {
    setNearby(null);
    setLocError("");
    setLoading(true);
    loadFeatured();
  };

  const handleRetry = () => {
    setError("");
    setLoading(true);
    loadFeatured();
  };

  const visibleGrounds = nearby
    ? nearby.grounds
    : search
      ? grounds.filter((g) => `${g.name} ${g.address || ""} ${g.cityId || ""}`.toLowerCase().includes(search.toLowerCase()))
      : grounds;

  return (
    <div className="space-y-8">
      <PageHeader
        title={<>Welcome{user?.name ? `, ${user.name}` : ""}!</>}
        description="Find grounds, book courts, and compete with teams."
        actions={
          <Button variant="primary" icon={<LocateFixed className="h-4 w-4" />} loading={locating} onClick={handleNearMe}>
            Near Me
          </Button>
        }
      />

      <Input
        icon={<Search className="h-4 w-4" />}
        placeholder="Search grounds by name or city..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {locError && (
        <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {locError}
        </div>
      )}

      {nearby && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-3xl">Nearby Grounds</h2>
            <Button variant="ghost" size="sm" onClick={handleClearNearby}>
              Clear
            </Button>
          </div>
          <div className="h-72 overflow-hidden rounded-xl border border-border">
            <NearMeMap grounds={nearby.grounds} center={nearby.center} />
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-3xl">{nearby ? "Results" : "Featured Grounds"}</h2>
          {nearby && <Badge variant="primary-light">{nearby.pagination.total} found</Badge>}
        </div>

        {loading ? (
          <CardGridSkeleton count={6} />
        ) : error ? (
          <EmptyState
            icon={<MapPinned className="h-6 w-6" />}
            title="Something went wrong"
            description={error}
            action={
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            }
          />
        ) : visibleGrounds.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No grounds found"
            description={search ? "Try a different search term." : "Check back later for new grounds near you."}
            action={
              search ? (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>
                  Clear search
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {visibleGrounds.map((ground) => {
              const distance = (ground as NearbySearchResponse["grounds"][number]).distance_km ?? null;
              const sports = Array.from(new Set((ground.courts || []).map((c) => c.sportType)));
              return (
                <Link key={ground.id} href={`/grounds/${ground.id}`} className="group block">
                  <Card className="h-full overflow-hidden transition-colors group-hover:shadow-card-hover">
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                      {ground.images && ground.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ground.images[0].url}
                          alt={ground.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20">
                          <MapPinned className="h-10 w-10 text-primary" />
                        </div>
                      )}
                      {distance != null && (
                        <Badge variant="primary-light" className="absolute right-3 top-3 shadow-sm">
                          <MapPin className="h-3 w-3" />
                          {distance} km
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-heading text-2xl leading-none">{ground.name}</h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                        {ground.address || "No address listed"}
                      </p>
                      {sports.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {sports.map((sport) => (
                            <Badge key={sport} variant="outline">
                              {sport}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
