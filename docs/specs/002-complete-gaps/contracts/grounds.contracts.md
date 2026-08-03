# Ground Module — API Contracts

**Base path**: `/api/grounds`

---

## GET `/api/grounds`
- **Auth**: Public
- **Query**: `city?: string, isVerified?: "true" | "false"`
- **Response 200**: `{ grounds: Ground[] }`

## GET `/api/grounds/featured`
- **Auth**: Public
- **Response 200**: `{ grounds: Ground[] }`

## GET `/api/grounds/my`
- **Auth**: JWT
- **Response 200**: `{ grounds: Ground[] }`

## GET `/api/grounds/:id`
- **Auth**: Public
- **Response 200**: `{ ground: Ground }`

## POST `/api/grounds`
- **Auth**: JWT (auto-assigns owner from `req.userId`)
- **Body**: Ground create fields
- **Response 201**: `{ message: "Ground created", ground: Ground }`

## PATCH `/api/grounds/:id`
- **Auth**: JWT (owner only)
- **Body**: Partial Ground update fields
- **Response 200**: `{ message: "Ground updated", ground: Ground }`

## DELETE `/api/grounds/:id`
- **Auth**: JWT (owner only)
- **Response 200**: `{ message: "Ground deleted" }`

## GET `/api/grounds/regions`
- **Auth**: Public
- **Response 200**: `{ regions: Region[] }`

## GET `/:groundId/courts`
- **Auth**: Public
- **Response 200**: `{ courts: Court[] }`

## POST `/:groundId/courts`
- **Auth**: JWT (owner/manager)
- **Body**: `{ name, sportType, basePrice, pricePerHour, depositAmount?, maxPlayers?, amenities? }`
- **Response 201**: `{ message: "Court created", court: Court }`

## PATCH `/courts/:id`
- **Auth**: JWT (owner/manager)
- **Body**: Partial Court fields
- **Response 200**: `{ message: "Court updated", court: Court }`

## DELETE `/courts/:id`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ message: "Court deleted" }`

## GET `/:groundId/schedules`
- **Auth**: Public
- **Response 200**: `{ schedules: GroundSchedule[] }`

## PUT `/:groundId/schedules/:dayOfWeek`
- **Auth**: JWT (owner/manager)
- **Body**: `{ openTime: string, closeTime: string, slotDuration?: int, isActive?: boolean }`
- **Response 200**: `{ message: "Schedule updated", schedule: GroundSchedule }`

## DELETE `/:groundId/schedules/:dayOfWeek`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ message: "Schedule removed" }`

## PATCH `/:groundId/settings`
- **Auth**: JWT (owner/manager)
- **Body**: `{ allowOnlineBooking?, allowWalkinBooking?, requireDeposit?, depositPercentage?, cancellationPolicy?, advanceBookingDays?, minBookingDuration?, maxBookingDuration? }`
- **Response 200**: `{ message: "Settings updated", setting: GroundSetting }`

## POST `/:groundId/images`
- **Auth**: JWT (owner/manager)
- **Body**: `{ url: string, isPrimary?: boolean, displayOrder?: int }`
- **Response 201**: `{ message: "Image added", image: GroundImage }`

## DELETE `/:groundId/images/:imageId`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ message: "Image removed" }`

## POST `/:groundId/invites`
- **Auth**: JWT (owner/manager)
- **Body**: `{ userId?: string, inviteePhone?: string, accessRole: "owner"|"manager"|"staff" }`
- **Response 201**: `{ message: "Staff invite sent", invite: GroundInvite }`

---

## Key Types
```typescript
type Ground = {
  id: string;
  ownerId: string;
  name: string;
  address: string | null;
  cityId: string | null;
  regionId: string | null;
  latitude: number | null;    // Decimal(10,7)
  longitude: number | null;   // Decimal(10,7)
  description: string | null;
  contactPhone: string | null;
  isVerified: boolean;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  courts?: Court[];
  schedules?: GroundSchedule[];
  setting?: GroundSetting;
  images?: GroundImage[];
  // access, invites, paymentMethods available if needed
};

type Court = {
  id: string;
  groundId: string;
  name: string;
  sportType: string;
  basePrice: number;
  pricePerHour: number;
  depositAmount: number | null;
  maxPlayers: number;
  amenities: any | null;  // JSON
  isActive: boolean;
};

type GroundSchedule = {
  id: string;
  groundId: string;
  dayOfWeek: number;    // 0=Sunday, 1=Monday...
  openTime: string;     // "09:00"
  closeTime: string;    // "22:00"
  slotDuration: number; // minutes, default 60
  isActive: boolean;
};

type GroundSetting = {
  groundId: string;
  allowOnlineBooking: boolean;
  allowWalkinBooking: boolean;
  requireDeposit: boolean;
  depositPercentage: number;
  cancellationPolicy: string | null;
  advanceBookingDays: number;
  minBookingDuration: number;
  maxBookingDuration: number;
};
```
