# 071 — Full-Text Search Backend

**Type:** AFK | **Blocked by:** 014

## What to build

Add PostgreSQL full-text search to the Ground model. Create a migration that adds a `tsvector` column for ground name, address, and description. Add a `tsvector` update trigger on insert/update. Create a `GIN` index on the tsvector column. Build the search endpoint: `GET /api/grounds/search?q=&sport=&city=&date=&minPrice=&maxPrice=&minRating=&amenities=&openNow=&sort=&page=&limit=`. The search uses `ts_query` for the text query and applies additional filters with standard `WHERE` clauses. Only return `verificationStatus: "approved"` grounds. Sort options: `relevance` (default, uses `ts_rank`), `price_asc`, `price_desc`, `rating_desc`. Paginate results. Write tests for search relevance, filters, pagination, and performance.

## Acceptance criteria

- [ ] tsvector column created with migration
- [ ] GIN index created
- [ ] Trigger for auto-update on insert/update
- [ ] Search endpoint with text query + all filters
- [ ] Sort options (relevance, price, rating)
- [ ] Only returns approved grounds
- [ ] Pagination works
- [ ] Tests pass
