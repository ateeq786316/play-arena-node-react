# User Story: Player Books a Court

## Persona
**Ali**, a cricket player who wants to book a court for an evening match.

## Prerequisites
- Ali has a registered account and is logged in
- Ali has a valid JWT access token

---

## Complete Frontend-to-Backend Flow

### Step 1: Discover Grounds
- **Frontend Page:** `/home` (Home/Discover page)
- **Action:** Ali sees featured grounds on the homepage
- **API Call:** `GET /api/grounds/featured`
- **Backend Route:** `ground.route.js` → `ground.controller.js` → `ground.service.js` → `ground.repo.js` → Prisma `ground.findMany()`
- **Response:**
```json
{
  "grounds": [
    {
      "id": "ground-123",
      "name": "Islamabad Cricket Ground",
      "address": "F-8, Islamabad",
      "city": "Islamabad",
      "region": "Punjab",
      "rating": 4.5,
      "reviewCount": 12,
      "courts": [
        {
          "id": "court-456",
          "name": "Main Cricket Pitch",
          "sportType": "cricket",
          "basePrice": 5000,
          "pricePerHour": 2000,
          "maxPlayers": 22
        }
      ]
    }
  ]
}
```

### Step 2: View Ground Detail
- **Frontend Page:** `/home/ground/[id]` (Ground detail page)
- **Action:** Ali clicks on "Islamabad Cricket Ground"
- **API Call:** `GET /api/grounds/ground-123`
- **Backend Route:** `ground.route.js` → `ground.controller.js` → `ground.service.js` → `ground.repo.js` → Prisma `ground.findUnique()`
- **Response:**
```json
{
  "ground": {
    "id": "ground-123",
    "name": "Islamabad Cricket Ground",
    "description": "A premium cricket ground with floodlights",
    "address": "F-8, Islamabad",
    "contactPhone": "051-1234567",
    "isVerified": true,
    "courts": [...],
    "schedules": [...],
    "images": [...]
  }
}
```

### Step 3: Check Court Availability
- **Frontend Page:** Same ground detail page
- **Action:** Ali selects "Main Cricket Pitch" and picks date `2026-08-05`
- **API Call:** `GET /api/bookings/courts/court-456/slots?date=2026-08-05`
- **Backend Route:** `booking.route.js` → `booking.controller.js` → `booking.service.js` → `booking.repo.js` → Prisma `booking.findMany()`
- **Response:**
```json
{
  "slots": [
    { "startTime": "06:00", "endTime": "07:00", "available": true },
    { "startTime": "07:00", "endTime": "08:00", "available": true },
    { "startTime": "18:00", "endTime": "19:00", "available": false },
    { "startTime": "19:00", "endTime": "20:00", "available": true }
  ]
}
```

### Step 4: Get Pricing Preview
- **Frontend Page:** Same ground detail page (booking form)
- **Action:** Ali selects time slot `19:00-20:00` and enters 20 players
- **API Call:** `GET /api/pricing/preview?groundId=ground-123&courtId=court-456&date=2026-08-05&startTime=19:00&endTime=20:00&players=20`
- **Backend Route:** `pricing.route.js` → `pricing.controller.js` → `pricing.service.js` → `pricing.repo.js` → Prisma
- **Response:**
```json
{
  "basePrice": 2000,
  "multiplier": 1.0,
  "finalPrice": 2000,
  "source": "base_hourly_rate"
}
```

### Step 5: Apply Coupon (Optional)
- **Frontend Page:** Same booking form
- **Action:** Ali enters coupon code `PLAYARENA10`
- **API Call:** `POST /api/pricing/coupon/validate`
- **Backend Route:** `pricing.route.js` → `pricing.controller.js` → `pricing.service.js` → `pricing.repo.js` → Prisma
- **Request Body:**
```json
{
  "code": "PLAYARENA10",
  "bookingAmount": 2000
}
```
- **Response:**
```json
{
  "valid": true,
  "coupon": {
    "code": "PLAYARENA10",
    "discountType": "percentage",
    "discountValue": 10,
    "description": "10% off on first booking"
  },
  "discount": 200,
  "finalAmount": 1800
}
```

### Step 6: Create Booking
- **Frontend Page:** Same ground detail page
- **Action:** Ali clicks "Book Now"
- **API Call:** `POST /api/bookings`
- **Backend Route:** `booking.route.js` → `booking.controller.js` → `booking.service.js` → `booking.repo.js` → Prisma (transaction for conflict detection)
- **Request Body:**
```json
{
  "groundId": "ground-123",
  "courtId": "court-456",
  "date": "2026-08-05",
  "startTime": "19:00",
  "endTime": "20:00",
  "playerCount": 20,
  "couponCode": "PLAYARENA10"
}
```
- **Response:**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": "booking-789",
    "status": "pending_payment_verification",
    "totalAmount": 1800,
    "depositAmount": 450,
    "paymentStatus": "unpaid",
    "date": "2026-08-05",
    "startTime": "19:00",
    "endTime": "20:00",
    "ground": {
      "name": "Islamabad Cricket Ground"
    },
    "court": {
      "name": "Main Cricket Pitch"
    }
  }
}
```

### Step 7: View My Bookings
- **Frontend Page:** `/bookings` (My Bookings page)
- **Action:** Ali navigates to see his booking
- **API Call:** `GET /api/bookings/my`
- **Backend Route:** `booking.route.js` → `booking.controller.js` → `booking.service.js` → `booking.repo.js` → Prisma `booking.findMany()`
- **Response:**
```json
{
  "bookings": [
    {
      "id": "booking-789",
      "status": "pending_payment_verification",
      "totalAmount": 1800,
      "depositAmount": 450,
      "paymentStatus": "unpaid",
      "date": "2026-08-05",
      "startTime": "19:00",
      "endTime": "20:00",
      "ground": {
        "id": "ground-123",
        "name": "Islamabad Cricket Ground"
      },
      "court": {
        "id": "court-456",
        "name": "Main Cricket Pitch"
      }
    }
  ]
}
```

### Step 8: Cancel Booking (if needed)
- **Frontend Page:** `/bookings` (My Bookings page)
- **Action:** Ali clicks "Cancel" on his booking
- **API Call:** `PATCH /api/bookings/booking-789/cancel`
- **Backend Route:** `booking.route.js` → `booking.controller.js` → `booking.service.js` → `booking.repo.js` → Prisma `booking.update()`
- **Response:**
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": "booking-789",
    "status": "cancelled",
    "totalAmount": 1800,
    "date": "2026-08-05"
  }
}
```

---

## Backend Architecture Summary

### Route Chain
All requests follow: `route.js` → `controller.js` → `service.js` → `repo.js` → `Prisma`

### Database Tables Involved
- `Ground` - Ground details
- `Court` - Court information
- `Booking` - Booking records
- `BookingFinance` - Financial details
- `BookingPayment` - Payment records
- `Coupon` - Discount coupons
- `CouponUsage` - Track coupon usage
- `PricingRule` - Pricing rules
- `HolidayPricing` - Holiday pricing overrides

### Key Business Logic
1. **Conflict Detection:** Uses `SELECT FOR UPDATE` transaction to prevent double-booking
2. **State Machine:** `pending_payment_verification` → `approved` → `completed`
3. **Deposit Calculation:** 25% of total amount by default
4. **Coupon Validation:** Checks validity, usage limits, and applies discount
5. **Pricing Rules:** Applies multipliers based on time, player count, and holidays

### Authentication
- All booking-related endpoints require JWT authentication via `authMiddleware`
- User ID is extracted from JWT token and attached to `req.userId`
- Ground-level RBAC checks for owner/manager/staff access where needed