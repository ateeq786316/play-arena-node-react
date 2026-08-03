# 062 — Region/City/Sport/Payment CRUD

**Type:** AFK | **Blocked by:** 009

## What to build

Build CRUD management pages for platform reference data at `/admin/data`. **Tabs**: Regions, Cities, Sports, Payment Methods.

**Regions** DataTable: Name, Code, Active toggle, Cities Count, Actions [Edit] [Delete]. Create/Edit Modal: name, code, isActive. **Cities** DataTable: Name, Region (dropdown), Display Order, Active toggle, Actions. Create/Edit Modal: name, region selector, display order. **Sports** DataTable: Name, Slug, Icon (emoji/Lucide picker), Active toggle, Actions. **Payment Methods** DataTable: Name, Slug, Account Details (for manual payments: bank name, account title, number, jazzcash number, easypaisa number), Display Order, Active toggle, Actions.

## Acceptance criteria

- [ ] 4 CRUD tabs for regions, cities, sports, payment methods
- [ ] Create/edit modals with validation
- [ ] Delete with confirmation (soft delete via isActive)
- [ ] All tables have loading, empty, error states
