# Booking Module — API Contracts

**Base path**: `/api/bookings` (inferred from route grouping)

---

## GET `/courts/:courtId/slots`
- **Auth**: Public
- **Query**: `date: string (YYYY-MM-DD)`
- **Response 200**: `{ slots: Slot[] }` — available time slots for given court+date

## POST `/`
- **Auth**: JWT
- **Body**: `{ groundId, courtId, date, startTime, endTime, totalAmount, depositAmount?, playerName?, playerPhone? }`
- **Response 201**: `{ message: "Booking created", booking: Booking }`

## GET `/my`
- **Auth**: JWT
- **Response 200**: `{ bookings: Booking[] }`

## GET `/:id`
- **Auth**: JWT
- **Response 200**: `{ booking: Booking }`

## PATCH `/:id/cancel`
- **Auth**: JWT (player or owner)
- **Response 200**: `{ message: "Booking cancelled", booking: Booking }`

## POST `/:id/payment`
- **Auth**: JWT
- **Body**: `{ amount, channel, paymentMethod, idempotencyKey }`
- **Response 201**: `{ message: "Payment recorded", payment: BookingPayment }`

## GET `/:id/finance`
- **Auth**: JWT
- **Response 200**: `BookingFinance`

## PATCH `/:id/status`
- **Auth**: JWT (owner/staff)
- **Body**: `{ status: BookingStatus, reason?: string }`
- **Response 200**: `{ message: string, booking: Booking }`

---

## Key Types
```typescript
enum BookingStatus {
  pending_payment_verification,
  approved,
  rejected,
  expired,
  cancelled,
  completed
}

type Booking = {
  id: string;
  groundId: string;
  courtId: string;
  playerId: string;
  date: string;         // "2026-08-15"
  startTime: string;    // "14:00"
  endTime: string;      // "15:00"
  totalAmount: number;
  depositAmount: number | null;
  status: BookingStatus;
  playerName: string | null;
  playerPhone: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  finance?: BookingFinance;
  payments?: BookingPayment[];
};

type BookingFinance = {
  bookingId: string;
  totalAmount: number;
  onlineReceived: number;
  offlineReceived: number;
  paymentStatus: "unpaid" | "partial" | "paid" | "overpaid";
};

type BookingPayment = {
  id: string;
  bookingId: string;
  amount: number;
  channel: string;      // "online" | "offline"
  paymentMethod: string;
  idempotencyKey: string;
  recordedById: string;
  createdAt: string;
};
```
