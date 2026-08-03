"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  RefreshCw,
  Scale,
  Ticket,
  Wallet,
} from "lucide-react";
import { api, ApiError } from "@playarena/shared/api";
import type { Booking, BookingStatus, Court, Ground, PaymentStatus } from "@playarena/shared/types";
import { formatCurrency, formatDate, formatRelativeTime, formatTime } from "@playarena/shared/utils";
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Skeleton,
  useToast,
} from "@/components/ui";

type BookingDetail = Booking & {
  court?: Court | null;
  ground?: Ground | null;
};

type StatusBadgeVariant = "success" | "warning" | "danger" | "info" | "outline";

const statusBadgeVariant: Record<BookingStatus, StatusBadgeVariant> = {
  approved: "success",
  completed: "success",
  pending_payment_verification: "warning",
  cancelled: "danger",
  rejected: "danger",
  expired: "outline",
};

const paymentStatusVariant: Record<PaymentStatus, StatusBadgeVariant> = {
  paid: "success",
  partial: "warning",
  unpaid: "outline",
  overpaid: "info",
};

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value}</span>
    </div>
  );
}

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = useCallback(() => {
    api.get<{ booking: BookingDetail }>(`/api/bookings/${id}`)
      .then((res) => setBooking(res.booking))
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? err.body.message || "Failed to load booking" : "Failed to load booking"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  const retry = () => {
    setError("");
    setLoading(true);
    fetchBooking();
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch<{ message: string; booking: BookingDetail }>(`/api/bookings/${id}/cancel`);
      setCancelOpen(false);
      toast("Booking cancelled", "success");
      fetchBooking();
    } catch (err: unknown) {
      setCancelOpen(false);
      toast(err instanceof ApiError ? err.body.message || "Failed to cancel booking" : "Something went wrong", "error");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<Ticket className="h-6 w-6" />}
        title="Booking unavailable"
        description={error}
        action={
          <Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={retry}>
            Retry
          </Button>
        }
      />
    );
  }

  if (!booking) return null;

  const canCancel = booking.status === "pending_payment_verification" || booking.status === "approved";
  const canDispute = booking.status === "completed" || booking.status === "cancelled";
  const finance = booking.finance;
  const payments = booking.payments || [];

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/home" },
          { label: "My Bookings", href: "/bookings" },
          { label: booking.status.replace(/_/g, " ") },
        ]}
      />

      <PageHeader
        title={`Booking · ${formatDate(booking.date)}`}
        description={`Reference ${booking.id.slice(0, 8)}`}
        actions={
          <>
            <Badge variant={statusBadgeVariant[booking.status]}>
              {booking.status.replace(/_/g, " ")}
            </Badge>
            {canCancel && (
              <Button variant="danger" size="sm" onClick={() => setCancelOpen(true)}>
                Cancel Booking
              </Button>
            )}
            {canDispute && (
              <Button variant="outline" size="sm" icon={<Scale className="h-4 w-4" />} onClick={() => router.push("/disputes/new")}>
                File Dispute
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
          <CardDescription>Court, schedule and amount for this booking.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          <DetailRow label="Ground" value={booking.ground?.name || "—"} />
          <DetailRow label="Court" value={booking.court?.name || booking.courtId} />
          <DetailRow label="Date" value={formatDate(booking.date)} />
          <DetailRow
            label="Time"
            value={`${formatTime(booking.startTime)} – ${formatTime(booking.endTime)}`}
          />
          <DetailRow label="Total Amount" value={formatCurrency(booking.totalAmount)} />
          {booking.depositAmount != null && (
            <DetailRow label="Deposit" value={formatCurrency(booking.depositAmount)} />
          )}
          <DetailRow
            label="Status"
            value={<Badge variant={statusBadgeVariant[booking.status]}>{booking.status.replace(/_/g, " ")}</Badge>}
          />
        </CardContent>
      </Card>

      {finance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Payment
            </CardTitle>
            <CardDescription>Payment breakdown for this booking.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <DetailRow label="Total" value={formatCurrency(finance.totalAmount)} />
            <DetailRow label="Online received" value={formatCurrency(finance.onlineReceived)} />
            <DetailRow label="Offline received" value={formatCurrency(finance.offlineReceived)} />
            <DetailRow
              label="Payment status"
              value={
                <Badge variant={paymentStatusVariant[finance.paymentStatus]}>
                  {finance.paymentStatus.replace(/_/g, " ")}
                </Badge>
              }
            />
          </CardContent>
        </Card>
      )}

      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payments
            </CardTitle>
            <CardDescription>Payments recorded against this booking.</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {payment.paymentMethod.replace(/_/g, " ")} · {payment.channel}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatRelativeTime(payment.createdAt)}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={cancelOpen}
        title="Cancel booking?"
        description="This booking will be cancelled and can't be restored. You may be subject to the ground's cancellation policy."
        confirmLabel="Cancel Booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
      />
    </div>
  );
}
