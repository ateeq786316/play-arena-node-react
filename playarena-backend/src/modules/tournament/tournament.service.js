import TournamentRepo from "../../repository/tournament.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class TournamentService {
  constructor() {
    this.repo = new TournamentRepo();
  }

  async createTournament(userId, data) {
    const { name, sport, format, maxTeams, minTeams } = data;
    if (!name || !sport || !format) {
      throw new error.NOTFOUNDERROR("name, sport, and format are required");
    }

    const validFormats = ["knockout", "round_robin", "group_knockout"];
    if (!validFormats.includes(format)) {
      throw new error.NOTFOUNDERROR("Invalid format. Allowed: knockout, round_robin, group_knockout");
    }

    return await this.repo.create({
      name,
      sport,
      format,
      maxTeams: maxTeams || 16,
      minTeams: minTeams || 4,
      groundId: data.groundId,
      registrationStarts: data.registrationStarts ? new Date(data.registrationStarts) : undefined,
      registrationEnds: data.registrationEnds ? new Date(data.registrationEnds) : undefined,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      description: data.description,
      rules: data.rules,
      ownerId: userId,
    });
  }

  async listTournaments(filters = {}) {
    const where = {};
    if (filters.sport) where.sport = filters.sport;
    if (filters.status) where.status = filters.status;
    if (filters.format) where.format = filters.format;
    return await this.repo.findAll(where);
  }

  async getMyTournaments(userId) {
    return await this.repo.findByOwnerId(userId);
  }

  async getTournamentById(id) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");
    return tournament;
  }

  async updateTournament(id, userId, data) {
    await this._checkOwnership(id, userId);
    return await this.repo.update(id, data);
  }

  async deleteTournament(id, userId) {
    await this._checkOwnership(id, userId);
    return await this.repo.delete(id);
  }

  async registerTeam(id, userId, body) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");

    if (tournament.status !== "registration_open") {
      throw new error.UNAUTHORIZED("Registration is not open");
    }

    const teamId = body.teamId;
    if (!teamId) throw new error.NOTFOUNDERROR("teamId is required");

    if (tournament.ownerId === userId) {
      throw new error.UNAUTHORIZED("Tournament owner cannot register a team");
    }

    const teamCount = await this.repo.countTeams(id);
    if (teamCount >= tournament.maxTeams) {
      throw new error.ALLREADYEXIST("Tournament is full");
    }

    const existing = await this.repo.findTournamentTeam(id, teamId);
    if (existing) throw new error.ALLREADYEXIST("Team already registered");

    return await this.repo.registerTeam({
      tournamentId: id,
      teamId,
      group: body.group,
    });
  }

  async withdrawTeam(id, userId, body) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");

    if (tournament.status === "completed" || tournament.status === "cancelled") {
      throw new error.UNAUTHORIZED("Cannot withdraw from a completed or cancelled tournament");
    }

    const teamId = body.teamId;
    const existing = await this.repo.findTournamentTeam(id, teamId);
    if (!existing) throw new error.NOTFOUNDERROR("Team not registered in this tournament");

    await this.repo.removeTournamentTeam(id, teamId);
    return { message: "Team withdrawn" };
  }

  async getBracket(id) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");

    const matches = await this.repo.findMatchesByTournament(id);
    const teams = await this.repo.getTeamsByTournament(id);

    return {
      format: tournament.format,
      status: tournament.status,
      teams,
      matches,
    };
  }

  async getStandings(id) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");

    return await this.repo.getStandings(id);
  }

  async enterMatchResult(id, matchId, userId, data) {
    const match = await this.repo.findMatchById(matchId);
    if (!match || match.tournamentId !== id) {
      throw new error.NOTFOUNDERROR("Match not found in this tournament");
    }

    const tournament = await this.repo.findById(id);
    if (!tournament || tournament.ownerId !== userId) {
      throw new error.UNAUTHORIZED("Only tournament owner can enter results");
    }

    if (match.status !== "scheduled" && match.status !== "in_progress") {
      throw new error.UNAUTHORIZED("Match cannot be scored");
    }

    const { score1, score2 } = data;
    if (score1 == null || score2 == null) {
      throw new error.NOTFOUNDERROR("score1 and score2 are required");
    }

    const winnerId = score1 > score2 ? match.team1Id : score2 > score1 ? match.team2Id : null;
    const updates = {
      score1,
      score2,
      winnerId,
      status: "completed",
      playedAt: new Date(),
    };

    const updated = await this.repo.updateMatch(matchId, updates);

    if (tournament.format === "knockout" && winnerId) {
      await this._advanceKnockoutWinner(tournament.id, match.round, match.matchIndex, winnerId);
    }

    if (tournament.format === "round_robin" || tournament.format === "group_knockout") {
      await this._updateStandings(id, match.team1Id, match.team2Id, score1, score2);
    }

    return updated;
  }

  async generateBracket(id, userId) {
    const tournament = await this.repo.findById(id);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");
    await this._checkOwnership(id, userId);

    const teams = await this.repo.getTeamsByTournament(id);
    if (teams.length < tournament.minTeams) {
      throw new error.NOTFOUNDERROR(`Need at least ${tournament.minTeams} teams to generate bracket`);
    }

    if (tournament.format === "knockout") {
      await this._generateKnockoutBracket(id, teams);
    } else if (tournament.format === "round_robin") {
      await this._generateRoundRobin(id, teams);
    } else if (tournament.format === "group_knockout") {
      await this._generateGroupKnockout(id, teams);
    }

    await this.repo.update(id, { status: "ongoing" });
    return { message: "Bracket generated" };
  }

  async _generateKnockoutBracket(tournamentId, teams) {
    const numTeams = teams.length;
    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(numTeams)));
    const sorted = [...teams].sort((a, b) => (a.seed || 999) - (b.seed || 999));

    const byes = nextPowerOf2 - numTeams;
    const firstRoundMatches = [];
    let left = 0;
    let right = sorted.length - 1;

    for (let i = 0; i < nextPowerOf2 / 2; i++) {
      if (i < byes) {
        firstRoundMatches.push({ team1: sorted[left], team2: null });
        left++;
      } else {
        firstRoundMatches.push({ team1: sorted[left], team2: sorted[right] });
        left++;
        right--;
      }
    }

    const matchData = [];
    let matchIndex = 0;
    for (const m of firstRoundMatches) {
      matchData.push({
        tournamentId,
        round: 1,
        matchIndex: matchIndex++,
        team1Id: m.team1?.teamId || null,
        team2Id: m.team2?.teamId || null,
      });
    }

    const totalRounds = Math.ceil(Math.log2(nextPowerOf2));
    for (let round = 2; round <= totalRounds; round++) {
      const matchesInRound = nextPowerOf2 / Math.pow(2, round);
      for (let i = 0; i < matchesInRound; i++) {
        matchData.push({
          tournamentId,
          round,
          matchIndex: matchIndex++,
        });
      }
    }

    await this.repo.createManyMatches(matchData);
  }

  async _generateRoundRobin(tournamentId, teams) {
    const teamIds = teams.map((t) => t.teamId);
    const matchData = [];

    for (let i = 0; i < teamIds.length; i++) {
      for (let j = i + 1; j < teamIds.length; j++) {
        matchData.push({
          tournamentId,
          round: 1,
          matchIndex: matchData.length,
          team1Id: teamIds[i],
          team2Id: teamIds[j],
        });
      }
    }

    await this.repo.createManyMatches(matchData);
  }

  async _generateGroupKnockout(tournamentId, teams) {
    const groups = {};
    for (const t of teams) {
      const g = t.group || "A";
      if (!groups[g]) groups[g] = [];
      groups[g].push(t.teamId);
    }

    const groupNames = Object.keys(groups).sort();
    const matchData = [];

    for (const groupName of groupNames) {
      const gTeams = groups[groupName];
      for (let i = 0; i < gTeams.length; i++) {
        for (let j = i + 1; j < gTeams.length; j++) {
          matchData.push({
            tournamentId,
            round: 1,
            matchIndex: matchData.length,
            team1Id: gTeams[i],
            team2Id: gTeams[j],
          });
        }
      }
    }

    await this.repo.createManyMatches(matchData);
  }

  async _advanceKnockoutWinner(tournamentId, round, matchIndex, winnerId) {
    const nextRound = round + 1;
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const nextMatch = await this.repo.findMatchesByRound(tournamentId, nextRound);

    if (nextMatchIndex >= nextMatch.length) return;

    if (matchIndex % 2 === 0) {
      await this.repo.updateMatch(nextMatch[nextMatchIndex].id, { team1Id: winnerId });
    } else {
      await this.repo.updateMatch(nextMatch[nextMatchIndex].id, { team2Id: winnerId });
    }
  }

  async _updateStandings(tournamentId, team1Id, team2Id, score1, score2) {
    if (score1 > score2) {
      await this._updateTeamStats(tournamentId, team1Id, { won: true });
      await this._updateTeamStats(tournamentId, team2Id, { won: false });
    } else if (score2 > score1) {
      await this._updateTeamStats(tournamentId, team2Id, { won: true });
      await this._updateTeamStats(tournamentId, team1Id, { won: false });
    } else {
      await this._updateTeamStats(tournamentId, team1Id, { drawn: true });
      await this._updateTeamStats(tournamentId, team2Id, { drawn: true });
    }
  }

  async _updateTeamStats(tournamentId, teamId, { won, drawn }) {
    const existing = await this.repo.findTournamentTeam(tournamentId, teamId);
    if (!existing) return;

    const data = {
      played: (existing.played || 0) + 1,
      won: (existing.won || 0) + (won ? 1 : 0),
      lost: (existing.lost || 0) + (!won && !drawn ? 1 : 0),
      drawn: (existing.drawn || 0) + (drawn ? 1 : 0),
      points: (existing.points || 0) + (won ? 3 : drawn ? 1 : 0),
    };

    await this.repo.updateTournamentTeam(tournamentId, teamId, data);
  }

  async _checkOwnership(tournamentId, userId) {
    const tournament = await this.repo.findById(tournamentId);
    if (!tournament) throw new error.NOTFOUNDERROR("Tournament not found");
    if (tournament.ownerId !== userId) {
      throw new error.UNAUTHORIZED("Only tournament owner can perform this action");
    }
    return tournament;
  }
}
