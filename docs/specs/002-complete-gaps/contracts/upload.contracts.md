# Upload Module — API Contracts

**Base path**: `/api/upload`

All routes accept `multipart/form-data` with a single file field named `file`.

**File limits**: 10MB max, validated by multer.

**Validation per type** (in `upload.service.js`):
- `avatar`: images only (jpeg, png, gif, webp), max 2MB
- `ground-image`: images only, max 5MB
- `booking-proof`: images + pdf, max 5MB
- `tournament-poster`: images only, max 5MB
- `general`: images + pdf + doc, max 10MB

---

## POST `/upload/:type`
- **Auth**: JWT
- **Upload type**: `avatar | ground-image | booking-proof | tournament-poster | general`
- **Body**: `multipart/form-data` with `file` field
- **Response 201**: `{ message: "File uploaded", url: string, key: string }`

## POST `/upload/ground-image/:groundId`
- **Auth**: JWT (owner/manager of ground)
- **Body**: `multipart/form-data` with `file` field
- **Response 201**: `{ message: "File uploaded", url: string, key: string }`

## POST `/upload/booking-proof/:groundId`
- **Auth**: JWT (owner/manager of ground)
- **Body**: `multipart/form-data` with `file` field
- **Response 201**: `{ message: "File uploaded", url: string, key: string }`

## POST `/upload/tournament-poster`
- **Auth**: JWT (tournament owner)
- **Body**: `multipart/form-data` with `file` field
- **Response 201**: `{ message: "File uploaded", url: string, key: string }`

## POST `/upload/avatar`
- **Auth**: JWT
- **Body**: `multipart/form-data` with `file` field (auto-updates `User.avatar`)
- **Response 201**: `{ message: "Avatar uploaded", url: string, key: string }`
