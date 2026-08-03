# 028 — Ground Image Gallery

**Type:** AFK | **Blocked by:** 005

## What to build

Build the image gallery page at `/grounds/:id/images`. **Grid view** of existing images with thumbnail preview. Each image shows: thumbnail, "Primary" badge if primary, drag handle for reorder, delete button. **Upload area**: drag-and-drop zone or click to select multiple files (max 5MB each, jpg/png/webp). Show upload progress per file. After upload: image appears in grid, user can set it as primary. **Set as Primary** button on each non-primary image. **Reorder**: drag image to new position, save order on drop. **Delete**: ConfirmDialog, remove from grid, delete from Cloudinary. Loading state: skeleton grid. Empty state: illustration + "Upload your first ground image" + upload CTA.

## Acceptance criteria

- [ ] Image grid with thumbnails and overlays
- [ ] Drag-and-drop upload zone with file validation
- [ ] Upload progress shown per file
- [ ] Set primary image works
- [ ] Drag-to-reorder with auto-save
- [ ] Delete with confirmation
- [ ] Loading skeleton and empty state with upload CTA
