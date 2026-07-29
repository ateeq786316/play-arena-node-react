# PlayArena Backend — Must-Follow Rules & Commands

## Golden Rules (I MUST follow these in EVERY response/action)

1. **Always update MD files first** — Before writing any code, check and update the relevant `.md` file in `vision/vision-backend/` (PLAN.md, CHANGES.md, STEPS.md, TESTING.md, COMMANDS.md).
2. **Document before doing** — Every change must be recorded in CHANGES.md BEFORE implementation begins.
3. **Write and run tests after every API** — After implementing every single endpoint/module, immediately write unit/integration tests using vitest + supertest. Run `npm test` to verify. Then update TESTING.md with results. Never move to the next module without passing tests.
4. **Never skip documentation** — No code change is complete without its corresponding MD update.
5. **Verify docs match code** — After implementation, verify that what's written in documentation matches what was actually done in code. Fix any discrepancies.
6. **Keep RULES.md in memory** — Re-read this file at the start of every session/task.
7. **Must update Postman after every API** — After creating every single endpoint, immediately add its test request to `vision/postman-collection.json`. Never move to the next endpoint without the Postman entry. The Postman collection must always be in sync with the implemented endpoints.
8. **Commit and push after every file change** — After every single file edit/addition that achieves a logical checkpoint (new endpoint working, test passing, doc updated), run `git add -A`, `git commit -m "4 word sensible summary"`, and `git push`. Never let uncommitted changes accumulate across multiple files or sessions.
9. **Run full test suite before each commit** — Before every `git commit`, run `npm test` and verify all tests pass. If any test fails, fix it before committing.

10. **Flag contradictory rules immediately** — If two rules conflict or seem to contradict each other, stop and ask the user for clarification before proceeding. Never silently pick one side when the rules are ambiguous.



## Commands I Must Follow



### Pre-Development

- `Read vision/vision-backend/RULES.md` — refresh rules at session start
- `Read vision/vision-backend/PLAN.md` — understand the plan before coding
- `Read vision/vision-backend/STEPS.md` — know current step before proceeding



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

