# 089 — Cloudinary Upload Migration

**Type:** AFK | **Blocked by:** None

## What to build

Replace the current S3 presigned URL upload system with Cloudinary upload. Install `cloudinary` npm package on the backend. Create `src/config/cloudinary.js` with Cloudinary config (cloud name, API key, API secret from env vars). Create upload endpoints:

- `POST /api/upload/image` — accepts multipart form data, uploads to Cloudinary, returns URL + public_id
- `POST /api/upload/images` — batch upload (multiple files)
- `DELETE /api/upload/image/:publicId` — delete from Cloudinary

Configure upload transformations: auto-resize to thumbnail (150x150), medium (800x600), maintain aspect ratio. Set max file size to 5MB, accepted formats jpg/png/webp. Strip EXIF data. Return the URL and public_id. Update the frontend upload components (ground images, avatars, team logos, complaint evidence) to use the new Cloudinary endpoints. Remove S3-related code and env vars (or keep for backward compatibility). Write tests.

## Acceptance criteria

- [ ] Cloudinary configured from env vars
- [ ] Single and batch upload endpoints working
- [ ] Image transformations (thumbnail, medium) applied
- [ ] File validation (size, format) enforced
- [ ] Delete endpoint works
- [ ] Frontend upload components use new endpoints
- [ ] S3 code removed (or deprecated)
- [ ] Tests pass
