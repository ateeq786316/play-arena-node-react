"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, ApiError } from "@playarena/shared/api";
import type {
  Court,
  CouponValidation,
  Ground,
  GroundSchedule,
  PricePreview,
  Region,
} from "@playarena/shared/types";
import { formatCurrency, formatDate, formatTime } from "@playarena/shared/utils";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  useToast,
} from "@/components/ui";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  MapPinned,
  Phone,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

interface SlotsResponse {
  slots: Slot[];
  schedule?: GroundSchedule;
  message?: string;
}

function toDateInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function GroundDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const bookingRef = useRef<HTMLDivElement>(null);

  const [ground, setGround] = useState<Ground | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [schedules, setSchedules] = useState<GroundSchedule[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  const [selectedCourt, setSelectedCourt] = useState("");
  const [bookingDate, setBookingDate] = useState(() => toDateInputValue(new Date()));
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotSchedule, setSlotSchedule] = useState<GroundSchedule | null>(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState("");
  const [slotsMessage, setSlotsMessage] = useState("");
  const [slotsRetryKey, setSlotsRetryKey] = useState(0);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      api.get<{ ground: Ground }>(`/api/grounds/${id}`),
      api.get<{ courts: Court[] }>(`/api/grounds/${id}/courts`).catch(() => ({ courts: [] as Court[] })),
      api.get<{ schedules: GroundSchedule[] }>(`/api/grounds/${id}/schedules`).catch(() => ({ schedules: [] as GroundSchedule[] })),
      api.get<{ regions: Region[] }>("/api/grounds/regions").catch(() => ({ regions: [] as Region[] })),
    ])
      .then(([groundRes, courtsRes, schedRes, regionsRes]) => {
        setGround(groundRes.ground);
        setCourts(courtsRes.courts);
        setSchedules(schedRes.schedules);
        setRegions(regionsRes.regions);
        setError("");
      })
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.body.message || "Failed to load ground" : "Failed to load ground");
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load, retryKey]);

  useEffect(() => {
    if (!selectedCourt || !bookingDate) return;
    api.get<SlotsResponse>(`/api/bookings/courts/${selectedCourt}/slots?date=${bookingDate}`)
      .then((res) => {
        setSlots(res.slots);
        setSlotSchedule(res.schedule ?? null);
        setSlotsMessage(res.message ?? "");
        setSlotsError("");
      })
      .catch((err: unknown) => {
        setSlots([]);
        setSlotsMessage("");
        setSlotsError(err instanceof ApiError ? err.body.message || "Failed to load slots" : "Failed to load slots");
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedCourt, bookingDate, slotsRetryKey]);

  useEffect(() => {
    if (!selectedCourt || !bookingDate || !startTime || !endTime) return;
    api.get<PricePreview>(
      `/api/pricing/preview?groundId=${id}&courtId=${selectedCourt}&date=${bookingDate}&startTime=${startTime}&endTime=${endTime}`,
    )
      .then((res) => {
        setPreview(res);
        setPreviewError("");
      })
      .catch((err: unknown) => {
        setPreview(null);
        setPreviewError(err instanceof ApiError ? err.body.message || "Failed to compute price" : "Failed to compute price");
      })
      .finally(() => setPreviewLoading(false));
  }, [id, selectedCourt, bookingDate, startTime, endTime]);

  const retry = () => {
    setError("");
    setLoading(true);
    setRetryKey((key) => key + 1);
  };

  const handleSelectCourt = (courtId: string) => {
    setSelectedCourt(courtId);
    setSlots([]);
    setSlotSchedule(null);
    setSlotsMessage("");
    setSlotsError("");
    setSlotsLoading(true);
    setStartTime("");
    setEndTime("");
    setPreview(null);
    setPreviewError("");
    setCouponResult(null);
    setCouponCode("");
  };

  const handleDateChange = (date: string) => {
    setBookingDate(date);
    setSlots([]);
    setSlotSchedule(null);
    setSlotsMessage("");
    setSlotsError("");
    setSlotsLoading(true);
    setStartTime("");
    setEndTime("");
    setPreview(null);
    setPreviewError("");
    setCouponResult(null);
    setCouponCode("");
  };

  const handleSlotSelect = (slot: Slot) => {
    if (!slot.available) return;
    setStartTime(slot.start);
    setEndTime(slot.end);
    setPreview(null);
    setPreviewError("");
    setPreviewLoading(true);
    setCouponResult(null);
    setCouponError("");
  };

  const handleRetrySlots = () => {
    setSlotsLoading(true);
    setSlotsError("");
    setSlotsRetryKey((key) => key + 1);
  };

  const handleBookFromCard = (courtId: string) => {
    handleSelectCourt(courtId);
    bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode || !preview) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.post<CouponValidation>("/api/pricing/coupon/validate", {
        code: couponCode,
        bookingAmount: preview.finalPrice,
      });
      setCouponResult(res);
    } catch (err: unknown) {
      setCouponResult(null);
      setCouponError(err instanceof ApiError ? err.body.message || "Invalid coupon" : "Invalid coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedCourt || !startTime || !endTime) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ message: string; booking: { id: string } }>("/api/bookings", {
        groundId: id,
        courtId: selectedCourt,
        date: bookingDate,
        startTime,
        endTime,
      });
      toast(res.message || "Booking created");
      setConfirmOpen(false);
      router.push(`/bookings/${res.booking.id}`);
    } catch (err: unknown) {
      toast(err instanceof ApiError ? err.body.message || "Booking failed" : "Booking failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-6 w-6" />}
        title="Could not load this ground"
        description={error}
        action={
          <Button variant="outline" size="sm" onClick={retry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!ground) {
    return (
      <EmptyState
        icon={<MapPinned className="h-6 w-6" />}
        title="Ground not found"
        description="This ground may have been removed or is no longer available."
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/grounds")}>
            Browse grounds
          </Button>
        }
      />
    );
  }

  const regionName = regions.find((region) => region.id === ground.regionId)?.name ?? "";
  const bookingEnabled = ground.isActive && ground.setting?.allowOnlineBooking !== false;
  const selectedCourtObj = courts.find((court) => court.id === selectedCourt) ?? null;
  const today = toDateInputValue(new Date());
  const maxDate = (() => {
    const days = ground.setting?.advanceBookingDays;
    if (!days || days <= 0) return undefined;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return toDateInputValue(date);
  })();
  const durationMins = startTime && endTime ? minutesOf(endTime) - minutesOf(startTime) : 0;
  const totalPrice = couponResult ? couponResult.finalAmount : preview?.finalPrice ?? 0;

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/home" },
            { label: "Grounds", href: "/grounds" },
            { label: ground.name },
          ]}
        />
        <PageHeader
          title={ground.name}
          description={
            <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {ground.address || "No address listed"}
              </span>
              {ground.contactPhone && (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {ground.contactPhone}
                </span>
              )}
            </span>
          }
          actions={
            <div className="flex flex-wrap items-center gap-2">
              {ground.isVerified && (
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              {ground.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}
              {regionName && (
                <Badge variant="primary-light">
                  <MapPin className="h-3 w-3" />
                  {regionName}
                </Badge>
              )}
            </div>
          }
        />
      </div>

      {!ground.isActive && (
        <div className="flex items-center gap-2 rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          This ground is currently inactive and cannot accept online bookings.
        </div>
      )}

      {ground.images && ground.images.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ground.images[0].url}
            alt={ground.name}
            className="h-64 w-full object-cover sm:h-80"
          />
        </div>
      )}

      {ground.description && (
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="font-heading text-3xl">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{ground.description}</p>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="font-heading text-3xl">Courts</h2>
        {courts.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title="No courts yet"
            description="This ground has not added any courts yet."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courts.map((court) => {
              const amenities = Array.isArray(court.amenities) ? (court.amenities as string[]) : [];
              return (
                <Card key={court.id} className="flex flex-col">
                  <CardContent className="flex flex-1 flex-col gap-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-heading text-2xl leading-none">{court.name}</h3>
                        <Badge variant="primary-light" className="mt-2">
                          {court.sportType}
                        </Badge>
                      </div>
                      <p className="text-right">
                        <span className="text-lg font-bold text-primary">{formatCurrency(court.pricePerHour)}</span>
                        <span className="text-xs text-muted-foreground">/hr</span>
                      </p>
                    </div>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Up to {court.maxPlayers} players
                    </p>
                    {amenities.length > 0 && <p className="text-sm text-muted-foreground">{amenities.join(", ")}</p>}
                    <div className="mt-auto pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        disabled={!bookingEnabled}
                        onClick={() => handleBookFromCard(court.id)}
                      >
                        Book this court
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section ref={bookingRef} className="scroll-mt-24 space-y-4">
        <h2 className="font-heading text-3xl">Book a Court</h2>

        {!bookingEnabled ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                {ground.isActive
                  ? "Online booking is currently disabled for this ground."
                  : "Online booking is unavailable while this ground is inactive."}
              </p>
            </CardContent>
          </Card>
        ) : courts.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Nothing to book yet"
            description="This ground has no active courts available for booking."
          />
        ) : (
          <Card>
            <CardContent className="space-y-6 p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Select label="Court" value={selectedCourt} onChange={(e) => handleSelectCourt(e.target.value)}>
                  <option value="">Select a court</option>
                  {courts.map((court) => (
                    <option key={court.id} value={court.id}>
                      {court.name} — {court.sportType}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Date"
                  type="date"
                  min={today}
                  max={maxDate}
                  value={bookingDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>

              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 rounded-md" />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-danger">{slotsError}</p>
                  <Button variant="outline" size="sm" onClick={handleRetrySlots}>
                    Retry
                  </Button>
                </div>
              ) : slots.length === 0 && selectedCourt ? (
                <EmptyState
                  icon={<CalendarDays className="h-6 w-6" />}
                  title={slotsMessage || "No slots available"}
                  description="Try a different date or court."
                />
              ) : slots.length > 0 ? (
                <div className="space-y-3">
                  {slotSchedule && (
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatTime(slotSchedule.openTime)} – {formatTime(slotSchedule.closeTime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {slotSchedule.slotDuration} min slots
                      </span>
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    {slots.map((slot) => {
                      const selected = startTime === slot.start && endTime === slot.end;
                      return (
                        <Button
                          key={slot.start}
                          variant={selected ? "primary" : "outline"}
                          size="sm"
                          disabled={!slot.available}
                          onClick={() => handleSlotSelect(slot)}
                        >
                          {formatTime(slot.start)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {selectedCourt && startTime && endTime && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/40 p-5">
                  <h3 className="font-heading text-2xl">Price Preview</h3>

                  {previewLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  ) : previewError ? (
                    <p className="text-sm text-danger">{previewError}</p>
                  ) : preview ? (
                    <div className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Slot</span>
                          <span className="text-right font-medium">
                            {formatDate(bookingDate)} · {formatTime(startTime)} – {formatTime(endTime)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Base price</span>
                          <span>{formatCurrency(preview.basePrice)}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-muted-foreground">Pricing</span>
                          <span>
                            ×{preview.multiplier}
                            {preview.source !== "base" ? ` (${preview.source})` : ""}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 border-t border-border pt-2 font-semibold">
                          <span>Subtotal</span>
                          <span>{formatCurrency(preview.finalPrice)}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="flex-1">
                          <Input
                            label="Coupon"
                            icon={<Ticket className="h-4 w-4" />}
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              setCouponResult(null);
                              setCouponError("");
                            }}
                          />
                        </div>
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode}
                          loading={couponLoading}
                        >
                          Apply
                        </Button>
                      </div>
                      {couponError && <p className="text-sm text-danger">{couponError}</p>}
                      {couponResult && (
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between gap-4 text-emerald-700">
                            <span>Coupon {couponResult.coupon.code}</span>
                            <span>−{formatCurrency(couponResult.discount)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4 border-t border-border pt-2 font-semibold">
                            <span>Total</span>
                            <span>{formatCurrency(couponResult.finalAmount)}</span>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        size="lg"
                        icon={<CalendarDays className="h-4 w-4" />}
                        onClick={() => setConfirmOpen(true)}
                      >
                        Confirm Booking
                      </Button>
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {schedules.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-heading text-3xl">Weekly Hours</h2>
          <Card>
            <div className="divide-y divide-border">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
                  <span className="font-medium">{dayNames[schedule.dayOfWeek]}</span>
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(schedule.openTime)} – {formatTime(schedule.closeTime)}
                    <Badge variant="outline" className="ml-1">
                      {schedule.slotDuration} min
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!submitting) setConfirmOpen(false);
        }}
        title="Confirm Booking"
        description="Review your booking details before confirming."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} loading={submitting}>
              Confirm Booking
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Ground</span>
            <span className="text-right font-medium">{ground.name}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Court</span>
            <span className="text-right font-medium">{selectedCourtObj?.name || selectedCourt}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Date</span>
            <span className="text-right font-medium">{formatDate(bookingDate)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Time</span>
            <span className="text-right font-medium">
              {formatTime(startTime)} – {formatTime(endTime)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Duration</span>
            <span className="text-right font-medium">{durationMins} minutes</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3 font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          {couponResult && (
            <p className="text-xs text-muted-foreground">
              Includes coupon {couponResult.coupon.code} (−{formatCurrency(couponResult.discount)})
            </p>
          )}
          {ground.setting?.requireDeposit !== false && (
            <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
              A deposit may be required to confirm this booking. You will complete payment after booking.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
}
