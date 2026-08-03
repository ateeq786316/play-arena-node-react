# Auth Flow Documentation

## Token Architecture
- **accessToken**: 15-minute JWT used to authenticate API requests
- **refreshToken**: 7-day JWT used to obtain new accessToken
- Both stored as httpOnly cookies (inaccessible to JavaScript)
- JWT secrets: `env.ACCESSTOKEN` and `env.REFRESHTOKEN` (separate secrets)

## Cookie Configuration
```javascript
// accessToken — 15 minutes
{ httpOnly: true, sameSite: "lax", secure: false, maxAge: 900000 }

// refreshToken — 7 days
{ httpOnly: true, sameSite: "lax", secure: false, maxAge: 604800000 }
```

## Auth Middleware (`src/middlewares/auth.middleware.js`)
1. Reads `req.cookies.accessToken`
2. Verifies with `jwt.verify(token, env.ACCESSTOKEN)`
3. Sets `req.userId = decoded.id`
4. On failure: throws 401 "Access token required" or "Invalid or expired token"

## Registration Flow
1. `POST /api/user/register` → creates user with `isVerified: false`, sends OTP email, returns tokens
2. User enters OTP → `POST /api/user/verify-otp` → sets `isVerified: true`
3. Optionally: `POST /api/user/resend-otp` for new OTP (10-minute expiry)

## Login Flow
1. `POST /api/user/login` → validates credentials, generates tokens, sets cookies
2. Response includes user object

## Token Refresh Flow
1. Frontend detects 401 from API response
2. Calls `POST /api/user/refresh` (refreshToken read from cookie automatically)
3. Server verifies old refreshToken, rotates both tokens, sets new cookies
4. Frontend retries original request

## Logout Flow
1. `POST /api/user/logout` → clears both cookies
2. Frontend redirects to login page

## Google OAuth Flow
1. Frontend links to `GET /api/user/google` → redirects to Google consent screen
2. Google redirects to callback URL → `GET /api/user/google/callback`
3. Passport handles OAuth validation; controller creates user if new, returns tokens
4. **Note**: Currently always creates new user (`GoogleLoginService` throws if email exists)

## Password Reset Flow
1. `POST /api/user/forgot-password` → sends email with reset link
2. Email contains link: `{CORS_ORIGIN}/api/user/reset-password/{rawToken}`
3. `GET /api/user/reset-password/:token` → validates token, returns `userId`
4. Frontend shows new password form, calls `POST /api/user/update-password`

## Frontend Middleware Logic (Next.js)
- Read `accessToken` cookie in middleware
- If no token + route requires auth → redirect to `/login?redirect={path}`
- If has token + route is auth page (`/login`, `/signup`, `/forgot-password`, etc.) → redirect to `/home`
- Admin routes (`/admin/*`) → additionally check `user.role === "admin"`

## API Client Interceptor Logic
```typescript
// Pseudo-code for fetch wrapper
async function apiClient(endpoint, options) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",  // sends cookies automatically
  });
  if (res.status === 401 && !endpoint.includes("/refresh")) {
    await fetch(`${BASE_URL}/api/user/refresh`, { method: "POST", credentials: "include" });
    return apiClient(endpoint, options);  // retry
  }
  if (!res.ok) throw new ApiError(res.status, await res.json());
  return res.json();
}
```

## Error Responses
All errors follow `{ message: string }` format. Status codes:
- **400**: Validation error
- **401**: Unauthorized (missing/invalid token)
- **404**: Resource not found
- **409**: Resource already exists
- **500**: Internal server error
