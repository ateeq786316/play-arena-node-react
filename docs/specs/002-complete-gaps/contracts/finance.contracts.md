# Finance Module — API Contracts

**Base path**: `/api/finance`

---

## GET `/payment-methods`
- **Auth**: Public
- **Response 200**: `{ methods: PaymentMethod[] }`

## GET `/payment-methods/ground/:id`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ methods }`

## PATCH `/grounds/:id/payment-methods/:methodId`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ message: "Payment method toggled", result }`

## GET `/grounds/:id/finance`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ finance }` — includes totals, payment breakdown

## GET `/grounds/:id/reports`
- **Auth**: JWT (owner/manager)
- **Query**: `startDate?, endDate?`
- **Response 200**: `{ report }`

## POST `/grounds/:id/cash-session/open`
- **Auth**: JWT (owner/manager)
- **Body**: `{ openingCash: number, notes?: string }`
- **Response 201**: `{ message: "Cash session opened", session: CashSession }`

## POST `/grounds/:id/cash-session/:sessionId/close`
- **Auth**: JWT (owner/manager)
- **Body**: `{ closingCash: number, notes?: string }`
- **Response 200**: `{ message: "Cash session closed", session: CashSession }`

## GET `/grounds/:id/cash-sessions`
- **Auth**: JWT (owner/manager)
- **Response 200**: `{ sessions: CashSession[] }`

## GET `/admin/finance`
- **Auth**: JWT (admin)
- **Response 200**: `{ finance }`

---

## Key Types
```typescript
type PaymentMethod = {
  id: string;
  name: string;       // "Cash", "Bank Transfer", "JazzCash", "EasyPaisa" etc.
  slug: string;
  isActive: boolean;
  displayOrder: number;
};

enum CashSessionStatus { open, closed }

type CashSession = {
  id: string;
  groundId: string;
  openedById: string;
  closedById: string | null;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  closingCash: number | null;
  expectedCash: number | null;
  variance: number | null;
  status: CashSessionStatus;
  notes: string | null;
};
```
