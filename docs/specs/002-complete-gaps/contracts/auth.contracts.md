# Auth Module — API Contracts

**Base path**: `/api/user` (mounted in app.js)

## Cookie Configuration

Both tokens are httpOnly, sameSite=lax, secure=false (dev).

| Cookie | Max Age | Purpose |
|--------|---------|---------|
| `accessToken` | 15 min | Authenticate API requests |
| `refreshToken` | 7 days | Obtain new accessToken |

Auth middleware reads `req.cookies.accessToken`, verifies with `jwt.verify(token, env.ACCESSTOKEN)`, sets `req.userId`.

---

## POST `/api/user/register`
- **Auth**: Public
- **Body**: `{ name: string (2-50 chars), email: string (valid, no "+"), password: string (6-10 chars, 1 digit, 1 special !@#$%), mobile: string }`
- **Response 201**: `{ message: string, user: User }` + sets `accessToken` + `refreshToken` cookies
- **Errors**: 400 validation, 409 user exists

## POST `/api/user/verify-otp`
- **Auth**: Public
- **Body**: `{ email: string, otp: string (6 digits) }`
- **Response 200**: `{ message: "Email verified successfully" }`

## POST `/api/user/resend-otp`
- **Auth**: Public
- **Body**: `{ email: string }`
- **Response 200**: `{ message: "OTP resent" }`

## POST `/api/user/login`
- **Auth**: Public
- **Body**: `{ email: string, password: string (6-10 chars) }`
- **Response 200**: `{ message: string, user: User }` + sets cookies
- **Errors**: 401 wrong credentials

## POST `/api/user/refresh`
- **Auth**: Public (reads cookie or body)
- **Body**: `{ refreshToken?: string }` (optional, falls back to cookie)
- **Response 200**: `{ message: "Token refreshed" }` + new cookies
- **Errors**: 401 invalid/expired

## POST `/api/user/logout`
- **Auth**: Public
- **Body**: —
- **Response 200**: `{ message: "Logged out successfully" }` + clears cookies

## GET `/api/user/profile`
- **Auth**: JWT
- **Response 200**: `{ user: User }`

## PATCH `/api/user/profile`
- **Auth**: JWT
- **Body**: `{ name?: string, avatar?: string }`
- **Response 200**: `{ message: "Profile updated", user: User }`

## GET `/api/user/google`
- **Auth**: Public
- **Action**: Redirects to Google OAuth

## GET `/api/user/google/callback`
- **Auth**: Public (passport)
- **Response 201**: `{ message: string, user: User }` + sets cookies

## POST `/api/user/forgot-password`
- **Auth**: Public
- **Body**: `{ email: string }`
- **Response 200**: `{ message: "Password reset link sent to email" }`

## GET `/api/user/reset-password/:token`
- **Auth**: Public
- **Response 200**: `{ userId: string, message: "User verified. Provide new password." }`

## POST `/api/user/update-password`
- **Auth**: JWT
- **Body**: `{ password: string }`
- **Response 200**: `{ message: "Password updated successfully", userId: string }`

---

## User Object Shape (from Prisma)
```typescript
type User = {
  id: string;           // UUID
  name: string | null;
  email: string;
  avatar: string | null;
  authProvider: "local" | "google";
  password: string | null;    // never returned to frontend
  mobile: string | null;
  role: string;               // "player" default
  refreshToken: string | null;
  isVerified: boolean;
  otpCode: string | null;
  otpExpiry: string | null;   // ISO date
  createdAt: string;
  updatedAt: string;
}
```
