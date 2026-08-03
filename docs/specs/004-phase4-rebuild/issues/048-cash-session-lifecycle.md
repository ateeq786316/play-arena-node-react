# 048 — Cash Session Lifecycle

**Type:** AFK | **Blocked by:** 009

## What to build

Build cash session management on the staff dashboard. **Open Session** button (shown when no open session exists): Modal with Opening Cash amount input. Submit → session created with `status: "open"`, timestamp, staff ID.

**Active Session Card** (shown when session is open): Opening Cash (PKR), Expected Cash (auto-calculated, updated live), Current Payments count, [Close Session] button.

**Close Session** → Modal: shows Opening Cash, Expected Cash (auto), Enter Closing Cash (staff counts physical cash and inputs). On submit → system calculates `variance = closingCash - expected`. If variance > threshold (PKR 500 or 2%): flag session, show warning "Variance detected: PKR -X. Owner will be notified." If variance within threshold: session closes cleanly, green success.

**Session History** table (below): Date, Opened By, Opening, Expected, Closing, Variance, Status (OK/Flagged), Actions [View].

## Acceptance criteria

- [ ] Open session modal with opening cash input
- [ ] Active session card with live expected cash
- [ ] Close session modal with closing cash input
- [ ] Variance auto-calculation on close
- [ ] Variance threshold warning (flagged vs clean)
- [ ] Session history table
- [ ] Loading, error states
