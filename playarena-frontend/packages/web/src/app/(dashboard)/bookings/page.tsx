"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CalendarDays, ChevronRight, Search, Ticket } from "lucide-react";
import { api } from "@playarena/shared/api";
import type { Booking, BookingStatus, Court } from "@playarena/shared/types";
import { formatCurrency, formatDate, formatTime } from "@playarena/shared/utils";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  PageHeader,
  Skeleton,
  Tabs,
} from "@/components/ui";

type BookingListItem = Booking & {
  court?: Court | null;
  ground?: { id: string; name: string } | null;
};

type StatusBadgeVariant = "success" | "warning" | "danger" | "outline";

const statusBadgeVariant: Record<BookingStatus, StatusBadgeVariant> = {
  approved: "success",
  completed: "success",
  pending_payment_verification: "warning",
  cancelled: "danger",
  rejected: "danger",
  expired: "outline",
};

const todayString = () => new Date().toLocaleDateString("en-CA");

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(() => {
    api.get<{ bookings: BookingListItem[] }>("/api/bookings/my")
      .then((res) => setBookings(res.bookings))
      .catch(() => setError("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const retry = () => {
    setError("");
    setLoading(true);
    fetchBookings();
  };

  const renderList = (active: string) => {
    const today = todayString();
    const filtered = bookings.filter((b) => {
      const dateStr = b.date.slice(0, 10);
      return active === "upcoming" ? dateStr >= today : dateStr < today;
    });

    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="mt-3 h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={<CalendarDays className="h-6 w-6" />}
          title="Couldn't load your bookings"
          description={error}
          action={
            <Button variant="outline" size="sm" icon={<Search className="h-4 w-4" />} onClick={retry}>
              Retry
            </Button>
          }
        />
      );
    }

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={<Ticket className="h-6 w-6" />}
          title={`No ${active} bookings`}
          description="Find a ground and book a court to get started."
          action={
            <Link href="/home">
              <Button size="sm" icon={<Search className="h-4 w-4" />}>
                Browse Grounds
              </Button>
            </Link>
          }
        />
      );
    }

    return (
      <div className="space-y-3">
        {filtered.map((booking) => (
          <Link key={booking.id} href={`/bookings/${booking.id}`} className="group block">
            <Card className="transition-colors group-hover:border-primary/50">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadgeVariant[booking.status]}>
                      {booking.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-sm font-semibold">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                  <p className="mt-2 font-medium">
                    {formatDate(booking.date)} · {formatTime(booking.startTime)} – {formatTime(booking.endTime)}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {booking.court?.name || "Court"}
                    {booking.ground?.name ? ` · ${booking.ground.name}` : ""}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Bookings"
        description="Review upcoming and past court bookings."
      />
      <Tabs
        items={[
          { value: "upcoming", label: "Upcoming" },
          { value: "past", label: "Past" },
        ]}
        defaultValue="upcoming"
      >
        {renderList}
      </Tabs>
    </div>
  );
}
