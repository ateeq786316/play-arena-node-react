"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { api } from "@playarena/shared/api";
import type { City, Ground, Region } from "@playarena/shared/types";

type RegionWithCities = Region & { cities: City[] };
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardGridSkeleton,
  EmptyState,
  Input,
  PageHeader,
  Pagination,
  Select,
} from "@/components/ui";
import { CheckCircle2, MapPin, MapPinned, Search, SlidersHorizontal } from "lucide-react";

const PAGE_SIZE = 9;

export default function GroundsBrowsePage() {
  const [regions, setRegions] = useState<RegionWithCities[]>([]);
  const [grounds, setGrounds] = useState<Ground[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedSport, setSelectedSport] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    Promise.all([
      api.get<{ regions: RegionWithCities[] }>("/api/grounds/regions").catch(() => ({ regions: [] as RegionWithCities[] })),
      api.get<{ grounds: Ground[] }>("/api/grounds").catch(() => ({ grounds: [] as Ground[] })),
    ])
      .then(([regionsRes, groundsRes]) => {
        setRegions(regionsRes.regions);
        setGrounds(groundsRes.grounds);
        setError("");
      })
      .catch(() => setError("Failed to load grounds."))
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

  const cityNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const region of regions) {
      for (const city of region.cities) map[city.id] = city.name;
    }
    return map;
  }, [regions]);

  const cities = useMemo(
    () => regions.find((region) => region.id === selectedRegion)?.cities ?? [],
    [regions, selectedRegion],
  );

  const sportOptions = useMemo(
    () =>
      Array.from(new Set(grounds.flatMap((ground) => (ground.courts || []).map((court) => court.sportType)))).sort(),
    [grounds],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return grounds.filter((ground) => {
      if (selectedRegion && ground.regionId !== selectedRegion) return false;
      if (selectedCity && ground.cityId !== selectedCity) return false;
      if (selectedSport && !(ground.courts || []).some((court) => court.sportType === selectedSport)) return false;
      if (query) {
        const haystack = `${ground.name} ${ground.address || ""} ${cityNames[ground.cityId || ""] || ""}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [grounds, selectedRegion, selectedCity, selectedSport, search, cityNames]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = Boolean(selectedRegion || selectedCity || selectedSport || search);

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedCity("");
    setPage(1);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
    setPage(1);
  };

  const handleSportChange = (value: string) => {
    setSelectedSport(value);
    setPage(1);
  };

  const handleReset = () => {
    setSelectedRegion("");
    setSelectedCity("");
    setSelectedSport("");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Browse Grounds" description="Search by region, city, and sport to find your next court." />

      <Card>
        <CardContent className="p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Region"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              <option value="">All regions</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </Select>
            <Select
              label="City"
              value={selectedCity}
              disabled={!selectedRegion}
              onChange={(e) => handleCityChange(e.target.value)}
            >
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </Select>
            <Select
              label="Sport"
              value={selectedSport}
              onChange={(e) => handleSportChange(e.target.value)}
            >
              <option value="">All sports</option>
              {sportOptions.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </Select>
            <Input
              label="Search"
              icon={<Search className="h-4 w-4" />}
              placeholder="Search by name or city..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading grounds..." : `${filtered.length} ground${filtered.length === 1 ? "" : "s"} found`}
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                Reset filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <CardGridSkeleton count={6} />
      ) : error ? (
        <EmptyState
          icon={<MapPinned className="h-6 w-6" />}
          title="Could not load grounds"
          description={error}
          action={
            <Button variant="outline" size="sm" onClick={retry}>
              Retry
            </Button>
          }
        />
      ) : paged.length === 0 ? (
        <EmptyState
          icon={<SlidersHorizontal className="h-6 w-6" />}
          title="No grounds match your filters"
          description="Try adjusting your search or clearing the active filters."
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={handleReset}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((ground) => (
              <Link key={ground.id} href={`/grounds/${ground.id}`} className="group block">
                <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/60">
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
                    {ground.isVerified && (
                      <Badge variant="success" className="absolute left-3 top-3 shadow-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-heading text-2xl leading-none">{ground.name}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{ground.address || "No address listed"}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(ground.courts || []).map((court) => (
                        <Badge key={court.id} variant="outline">
                          {court.sportType}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
