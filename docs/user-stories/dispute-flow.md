# User Story: Player Files a Dispute

## Persona
**Ali**, a cricket player who had a booking conflict and wants to file a dispute.

## Prerequisites
- Ali has a registered account and is logged in
- Ali has an existing booking

---

## Complete Frontend-to-Backend Flow

### Step 1: Navigate to Disputes
- **Frontend Page:** `/disputes` (Disputes list page)
- **Action:** Ali clicks on "Disputes" in the sidebar
- **API Call:** `GET /api/disputes/my`
- **Backend Route:** `dispute.route.js` → `dispute.controller.js` → `dispute.service.js` → `dispute.repo.js` → Prisma
- **Response:**
```json
{
  "disputes": [
    {
      "id": "dispute-123",
      "type": "booking_conflict",
      "reason": "Double booked",
      "status": "pending",
      "createdAt": "2026-08-01T10:30:00Z"
    }
  ]
}
```

### Step 2: File New Dispute
- **Frontend Page:** `/disputes/new` (New dispute page)
- **Action:** Ali clicks "File New Dispute"
- **API Call 1:** `GET /api/bookings/my` (to populate booking dropdown)
- **Backend Route:** `booking.route.js` → `booking.controller.js` → `booking.service.js` → `booking.repo.js` → Prisma
- **Response:**
```json
{
  "bookings": [
    {
      "id": "booking-789",
      "date": "2026-08-05",
      "startTime": "19:00",
      "endTime": "20:00",
      "status": "approved",
      "ground": {
        "name": "Islamabad Cricket Ground"
      }
    }
  ]
}
```

### Step 3: Submit Dispute Form
- **Frontend Page:** `/disputes/new` (New dispute page)
- **Action:** Ali fills the form and clicks "File Dispute"
- **API Call:** `POST /api/disputes/file`
- **Backend Route:** `dispute.route.js` → `dispute.controller.js` → `dispute.service.js` → `dispute.repo.js` → Prisma
- **Request Body:**
```json
{
  "bookingId": "booking-789",
  "type": "booking_conflict",
  "reason": "Court was already booked",
  "description": "I arrived at 19:00 but another group was already playing",
  "evidence": {
    "urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
  }
}
```
- **Response:**
```json
{
  "message": "Dispute filed",
  "dispute": {
    "id": "dispute-456",
    "bookingId": "booking-789",
    "filedById": "user-123",
    "type": "booking_conflict",
    "reason": "Court was already booked",
    "description": "I arrived at 19:00 but another group was already playing",
    "evidence": {
      "urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
    },
    "status": "pending"
  }
}
```

### Step 4: View Dispute Detail
- **Frontend Page:** `/disputes/[id]` (Dispute detail page)
- **Action:** Ali clicks on the dispute to see details
- **API Call:** `GET /api/disputes/dispute-456`
- **Backend Route:** `dispute.route.js` → `dispute.controller.js` → `dispute.service.js` → `dispute.repo.js` → Prisma
- **Response:**
```json
{
  "dispute": {
    "id": "dispute-456",
    "bookingId": "booking-789",
    "filedBy": {
      "id": "user-123",
      "name": "Ali Khan"
    },
    "type": "booking_conflict",
    "reason": "Court was already booked",
    "description": "I arrived at 19:00 but another group was already playing",
    "evidence": {
      "urls": ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"]
    },
    "status": "pending",
    "createdAt": "2026-08-03T14:30:00Z"
  }
}
```

### Step 5: Admin Reviews Dispute
- **Frontend Page:** `/admin/disputes` (Admin dispute queue)
- **Action:** Admin views all disputes
- **API Call:** `GET /api/disputes/all?status=pending`
- **Backend Route:** `dispute.route.js` → `dispute.controller.js` → `dispute.service.js` → `dispute.repo.js` → Prisma
- **Note:** This endpoint requires `requireAdmin` middleware
- **Response:**
```json
{
  "disputes": [
    {
      "id": "dispute-456",
      "bookingId": "booking-789",
      "filedBy": {
        "id": "user-123",
        "name": "Ali Khan",
        "email": "ali@example.com"
      },
      "type": "booking_conflict",
      "reason": "Court was already booked",
      "status": "pending",
      "createdAt": "2026-08-03T14:30:00Z"
    }
  ]
}
```

### Step 6: Admin Resolves Dispute
- **Frontend Page:** `/admin/disputes` or `/disputes/[id]`
- **Action:** Admin clicks "Resolve" and selects resolution action
- **API Call:** `PATCH /api/disputes/dispute-456/resolve`
- **Backend Route:** `dispute.route.js` → `dispute.controller.js` → `dispute.service.js` → `dispute.repo.js` → Prisma
- **Note:** This endpoint requires `requireAdmin` middleware
- **Request Body:**
```json
{
  "resolution": "Refund issued for double-booking",
  "action": "no_show_penalty"
}
```
- **Response:**
```json
{
  "message": "Dispute resolved",
  "dispute": {
    "id": "dispute-456",
    "status": "resolved",
    "resolution": "Refund issued for double-booking",
    "resolvedById": "admin-123",
    "resolvedAt": "2026-08-03T15:45:00Z"
  }
}
```

---

## Backend Architecture Summary

### Route Chain
All requests follow: `route.js` → `controller.js` → `service.js` → `repo.js` → `Prisma`

### Database Tables Involved
- `Dispute` - Dispute records
- `DamageClaim` - Damage claims (separate from disputes)
- `NoShowPenalty` - No-show penalties (created when action is "no_show_penalty")
- `Booking` - Related booking
- `User` - Filed by and resolved by users

### Key Business Logic
1. **Duplicate Prevention:** Checks if a dispute already exists for a booking
2. **Status Flow:** `pending` → `under_review` → `resolved` | `dismissed`
3. **No-Show Penalty:** When `action: "no_show_penalty"` is specified, creates a 500 PKR penalty
4. **Admin Access:** `/all` and `/:id/resolve` endpoints require `requireAdmin` middleware
5. **Evidence Storage:** Evidence URLs stored as JSON object

### Authentication & Authorization
- All dispute endpoints require JWT authentication via `authMiddleware`
- `/all` and `/:id/resolve` endpoints additionally require `requireAdmin` middleware
- Admin roles: `admin` or `super_admin`