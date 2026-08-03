# 042 — Leaderboard

**Type:** AFK | **Blocked by:** 009

## What to build

Build leaderboard at `/leaderboard`. **Tabs**: Teams (by ELO) / Players (by win rate). **Filters**: Sport dropwdown, City dropdown. **Teams Tab**: DataTable ranked by ELO descending. Columns: Rank, Team Name, Sport, ELO, Matches Played, Win Rate, City. Highlight current user's team with subtle indicator. **Players Tab**: DataTable ranked by win rate (min 10 matches). Columns: Rank, Player Name, Win Rate, Matches Played, Wins, Losses, ELO. **My Rank** card at top: shows current user's team/player rank. Pagination. Loading: skeleton table. Empty: "No data yet" for new sports/cities.

## Acceptance criteria

- [ ] Teams and Players tabs
- [ ] Ranked tables with all columns
- [ ] Sport and city filters affect rankings
- [ ] My Rank card at top
- [ ] Minimum matches requirement enforced (10 for players)
- [ ] Pagination
- [ ] Loading skeleton, empty state
