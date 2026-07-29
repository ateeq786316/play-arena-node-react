import RatingRepo from "../../repository/rating.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class RatingService {
  constructor() {
    this.repo = new RatingRepo();
  }

  async _validateCaptain(match, userId) {
    const isChallengerCaptain = await this.repo.findTeamMember(match.challengerTeamId, userId);
    const isOpponentCaptain = await this.repo.findTeamMember(match.opponentTeamId, userId);

    if (!isChallengerCaptain || !isOpponentCaptain) {
      if (!isChallengerCaptain && !isOpponentCaptain) {
        throw new error.UNAUTHORIZED("Only team captains can submit ratings");
      }
    }

    if (isChallengerCaptain && isChallengerCaptain.role !== "captain" && isChallengerCaptain.role !== "co_captain" ||
        isOpponentCaptain && isOpponentCaptain.role !== "captain" && isOpponentCaptain.role !== "co_captain") {
      throw new error.UNAUTHORIZED("Only team captains can submit ratings");
    }
  }

  async _isCaptainOrCoCaptain(teamId, userId) {
    const member = await this.repo.findTeamMember(teamId, userId);
    return member && (member.role === "captain" || member.role === "co_captain");
  }

  async submitRating(matchId, userId, data) {
    const match = await this.repo.findTeamMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");
    if (match.status !== "completed") throw new error.UNAUTHORIZED("Can only rate completed matches");

    const isCaptain = await this._isCaptainOrCoCaptain(match.challengerTeamId, userId) ||
                      await this._isCaptainOrCoCaptain(match.opponentTeamId, userId);
    if (!isCaptain) throw new error.UNAUTHORIZED("Only team captains can submit ratings");

    const existing = await this.repo.findMatchRating(matchId, userId);
    if (existing) throw new error.ALLREADYEXIST("You have already rated this match");

    const { skillRating, sportsmanshipRating, punctualityRating, reviewText } = data;
    if (!skillRating || !sportsmanshipRating || !punctualityRating) {
      throw new error.NOTFOUNDERROR("skillRating, sportsmanshipRating, and punctualityRating are required");
    }

    for (const rating of [skillRating, sportsmanshipRating, punctualityRating]) {
      if (rating < 1 || rating > 5) {
        throw new error.NOTFOUNDERROR("Ratings must be between 1 and 5");
      }
    }

    return await this.repo.createMatchRating({
      matchId,
      reviewerId: userId,
      skillRating,
      sportsmanshipRating,
      punctualityRating,
      reviewText,
    });
  }

  async getLeaderboard(sportId) {
    if (sportId) {
      return await this.repo.findTeamsBySport(sportId);
    }
    return await this.repo.findAllTeams();
  }

  async getPlayerStats(playerId) {
    const stats = await this.repo.findPlayerStat(playerId);
    if (!stats) {
      return {
        userId: playerId,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        goalsScored: 0,
        goalsConceded: 0,
      };
    }
    return stats;
  }

  async recordPlayerStats(matchId, userId, data) {
    const match = await this.repo.findTeamMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");
    if (match.status !== "completed") throw new error.UNAUTHORIZED("Can only record stats for completed matches");

    const isCaptain = await this._isCaptainOrCoCaptain(match.challengerTeamId, userId) ||
                      await this._isCaptainOrCoCaptain(match.opponentTeamId, userId);
    if (!isCaptain) throw new error.UNAUTHORIZED("Only team captains can record player stats");

    const { playerId, goals, assists, yellowCards, redCards, motm } = data;
    if (!playerId) throw new error.NOTFOUNDERROR("playerId is required");

    const existing = await this.repo.findPlayerMatchStat(matchId, playerId);
    if (existing) throw new error.ALLREADYEXIST("Stats already recorded for this player in this match");

    await this.repo.createPlayerMatchStat({
      matchId,
      playerId,
      teamId: match.challengerTeamId,
      goals: goals || 0,
      assists: assists || 0,
      yellowCards: yellowCards || 0,
      redCards: redCards || 0,
      motm: motm || false,
    });

    await this.repo.upsertPlayerStat(playerId, {
      matchesPlayed: { increment: 1 },
      goalsScored: { increment: goals || 0 },
      wins: match.scoreChallenger > match.scoreOpponent ? { increment: 1 } : undefined,
      losses: match.scoreChallenger < match.scoreOpponent ? { increment: 1 } : undefined,
      draws: match.scoreChallenger === match.scoreOpponent ? { increment: 1 } : undefined,
      goalsConceded: { increment: match.scoreOpponent || 0 },
    });

    return { message: "Player stats recorded" };
  }
}
