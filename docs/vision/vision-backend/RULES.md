# PlayArena Backend — Must-Follow Rules & Commands

## Golden Rules (I MUST follow these in EVERY response/action)

1. **Always update MD files first** — Before writing any code, check and update the relevant `.md` file in `docs/vision/vision-backend/` (PLAN.md, CHANGES.md, STEPS.md, TESTING.md, COMMANDS.md).
2. **Document before doing** — Every change must be recorded in CHANGES.md BEFORE implementation begins.
3. **Write and run tests after every API** — After implementing every single endpoint/module, immediately write unit/integration tests using vitest + supertest. Run `npm test` to verify. Then update TESTING.md with results. Never move to the next module without passing tests.
4. **Never skip documentation** — No code change is complete without its corresponding MD update.
5. **Verify docs match code** — After implementation, verify that what's written in documentation matches what was actually done in code. Fix any discrepancies.
6. **Keep RULES.md in memory** — Re-read this file at the start of every session/task.
7. **Must update Postman after every API** — After creating every single endpoint, immediately add its test request to `docs/vision/postman-collection.json`. Never move to the next endpoint without the Postman entry. The Postman collection must always be in sync with the implemented endpoints.
8. **Commit and push after every file change** — After every single file edit/addition that achieves a logical checkpoint (new endpoint working, test passing, doc updated), run `git add -A`, `git commit -m "<prefix>: 4 word summary"`, and `git push`. Never let uncommitted changes accumulate across multiple files or sessions.
9. **Run full test suite before each commit** — Before every `git commit`, run `npm test` and verify all tests pass. If any test fails, fix it before committing.

10. **Flag contradictory rules immediately** — If two rules conflict or seem to contradict each other, stop and ask the user for clarification before proceeding. Never silently pick one side when the rules are ambiguous.

11. **Data isolation in tests** — Every test suite must create its own data inline or via factories. Tests must never depend on run order, shared global state, or data created by another test suite.

12. **Input validation at entry** — All API inputs (body, params, query) must pass schema validation (Zod, express-validator, or DTOs) before reaching service logic. Never trust raw request data.

13. **Standardized API response shape** — All endpoints must return a uniform response format: `{ message?, data? }` for success, `{ message, statusCode }` for errors. Consistent envelope across the entire API.

14. **Zero hardcoded secrets** — Never commit raw credentials, tokens, API keys, or local URLs in code. All secrets go in `.env` (gitignored) and are parsed via Zod in `env.js`.

15. **Structured commit prefixes** — All commits must use a prefix tag with the 4-word summary: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`. (e.g. `feat: add user search endpoint`, `fix: booking conflict detection`, `test: write finance module tests`).

16. **Controllers are thin, services have logic** — Controllers only parse request data and call services. Zero business logic in controllers.

17. **All DB queries go through repositories** — Services must never call `prisma.*` directly. The repo layer is the single source of truth for data access.

18. **Use asyncHandler on every route** — Wrap every route handler with `asyncHandler` from `src/utils/asyncHandler.js`. Never use try/catch in controllers.

19. **Correct HTTP status codes** — `201` on create, `200` on read/update, `204` on delete. Never return 200 for everything.

20. **Soft delete everywhere** — Never use SQL `DELETE`. Always set `deletedAt` on rows that need removal. Filter `deletedAt: null` in all repo queries.

21. **Use Pino logger, never console.log** — All logging (info, warn, error, debug) goes through the logger module at `src/config/logger.js`.

22. **Transactional integrity for multi-table writes** — Use `prisma.$transaction` when writing to 2+ related tables in one operation.

23. **Consistent file naming** — Files: `kebab-case.js`. Classes: `PascalCase`. Exports: `default` for main class, named for utilities.

24. **Audit destructive actions** — Every delete, status change, or role update must create an `AuditLog` entry.

25. **Zod over express-validator for new endpoints** — Prefer Zod schemas for validation. They're composable, reusable, and can type-check.

26. **Index your query columns** — Every `@@index` in Prisma must cover the `where`, `orderBy`, and `join` columns used in repo queries. Check before writing migrations.

27. **One concern per file** — One class per file. No utility grab-bags. A repo file has one repo class, a service has one service class.

28. **Never mock what you don't own** — Mock only `prisma` and `env`. Never mock `fs`, `crypto`, `jwt`, `bcrypt` directly — mock the module that wraps them.

29. **Always use `@@map` for table names** — Every model must have `@@map("snake_case")`. Never let Prisma auto-generate table names.

30. **Return 409 for duplicate/conflict, not 400** — Unique constraint violations, double-booking, duplicate ratings → 409 Conflict. Validation errors → 400.

31. **`deletedAt` filter is the repo's job** — Every `findMany`/`findUnique` on soft-deletable models must include `deletedAt: null` in the `where` clause at the repo layer.

32. **Migration names describe the change, not the module** — Name migrations by what they do (e.g. `add_is_verified_to_grounds`), not `add_admin_module`.

33. **Keep .env.example in sync** — Every new env var must be added to `.env.example` immediately. Never let `.env.example` fall behind.

34. **No circular imports** — Never import from a module into its own repository or vice versa. Flow: route → controller → service → repo. One direction only.

35. **Skill-first execution** — Before performing any task from a user prompt, identify the best skill for the job. If the skill is already installed globally on the system, use it immediately. If not, find and install it globally before proceeding. This ensures 100% efficient and correct task execution. Never proceed without the right skill.



## Commands I Must Follow



### Pre-Development

- `Read docs/vision/vision-backend/RULES.md` — refresh rules at session start
- `Read docs/vision/vision-backend/PLAN.md` — understand the plan before coding
- `Read docs/vision/vision-backend/STEPS.md` — know current step before proceeding



### During Development

- `Update CHANGES.md` — log what changed, why, and when
- `Update STEPS.md` — mark steps as in_progress / completed
- `Update TESTING.md` — document test cases and results



### Post-Development

- `Update PROJECT_STATUS.md` — reflect new backend state in root vision
- `Write tests` — create unit/integration tests for the new module in `playarena-backend/tests/`
- `Run tests` — `npm test` must pass before declaring done

---



## File Structure

```
vision/
├── project-scope.md
├── PROJECT_STATUS.md
├── postman-collection.json   # Importable Postman tests — update after every module
└── vision-backend/
    ├── RULES.md              # Must-follow rules & commands
    ├── PLAN.md               # Overall backend development plan
    ├── CHANGES.md            # Log of every change made
    ├── STEPS.md              # Step-by-step progress tracker
    ├── TESTING.md            # Testing strategy, cases, and results
    ├── COMMANDS.md           # User-defined commands (editable by user)
    └── requirement.md        # Master spec — all module reqs, endpoints, business rules
```

---



## Enforcement

If at any point I fail to follow these rules, the user can call me out and I must:

1. Acknowledge the violation
2. Fix the documentation gap immediately
3. Update RULES.md if a new rule is needed to prevent recurrence

