import MatchRepo from "../../repository/match.repo.js";
import TeamRepo from "../../repository/team.repo.js";
import * as error from "../../shared/error/globalError.js";

const ELO_BASELINE = 1200;
const ELO_FLOOR = 100;
const K_FACTOR_NEW = 32;
const K_FACTOR_ESTABLISHED = 24;
const ESTABLISHED_THRESHOLD = 30;

export default class MatchService {
  constructor() {
    this.repo = new MatchRepo();
    this.teamRepo = new TeamRepo();
  }

  async createChallenge(userId, data) {
    const { opponentTeamId, groundId, proposedDate, message } = data;
    if (!opponentTeamId) throw new error.NOTFOUNDERROR("opponentTeamId is required");

    const challenger = await this.teamRepo.findMember(data.challengerTeamId, userId);
    if (!challenger || (challenger.role !== "captain" && challenger.role !== "co_captain")) {
      throw new error.UNAUTHORIZED("Only captain or co-captain can challenge");
    }

    if (data.challengerTeamId === opponentTeamId) {
      throw new error.NOTFOUNDERROR("Cannot challenge your own team");
    }

    const pending = await this.repo.findSentRequests(data.challengerTeamId);
    if (pending.some((r) => r.opponentTeamId === opponentTeamId && r.status === "pending")) {
      throw new error.ALLREADYEXIST("Challenge already pending with this team");
    }

    return await this.repo.createRequest({
      challengerTeamId: data.challengerTeamId,
      opponentTeamId,
      groundId,
      proposedDate: proposedDate ? new Date(proposedDate) : null,
      message,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
  }

  async getSentChallenges(userId, teamId) {
    await this._checkMemberAccess(teamId, userId);
    return await this.repo.findSentRequests(teamId);
  }

  async getReceivedChallenges(userId, teamId) {
    await this._checkMemberAccess(teamId, userId);
    return await this.repo.findReceivedRequests(teamId);
  }

  async acceptChallenge(userId, requestId) {
    const request = await this.repo.findRequestById(requestId);
    if (!request || request.status !== "pending") {
      throw new error.NOTFOUNDERROR("Challenge not found or not pending");
    }

    await this._checkCaptainAccess(request.opponentTeamId, userId);

    const match = await this.repo.createMatch({
      matchRequestId: request.id,
      challengerTeamId: request.challengerTeamId,
      opponentTeamId: request.opponentTeamId,
      groundId: request.groundId,
      scheduledDate: request.proposedDate,
      status: "scheduled",
    });

    await this.repo.updateRequest(requestId, { status: "accepted" });
    return match;
  }

  async rejectChallenge(userId, requestId) {
    const request = await this.repo.findRequestById(requestId);
    if (!request || request.status !== "pending") {
      throw new error.NOTFOUNDERROR("Challenge not found or not pending");
    }

    await this._checkCaptainAccess(request.opponentTeamId, userId);
    return await this.repo.updateRequest(requestId, { status: "rejected" });
  }

  async cancelChallenge(userId, requestId) {
    const request = await this.repo.findRequestById(requestId);
    if (!request || request.status !== "pending") {
      throw new error.NOTFOUNDERROR("Challenge not found or not pending");
    }

    await this._checkCaptainAccess(request.challengerTeamId, userId);
    return await this.repo.updateRequest(requestId, { status: "cancelled" });
  }

  async listMatches(userId, teamId) {
    await this._checkMemberAccess(teamId, userId);
    return await this.repo.findMatches(teamId);
  }

  async getMatchDetail(userId, matchId) {
    const match = await this.repo.findMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");

    const isMember =
      (await this.teamRepo.findMember(match.challengerTeamId, userId)) ||
      (await this.teamRepo.findMember(match.opponentTeamId, userId));
    if (!isMember) throw new error.UNAUTHORIZED("Not a participant in this match");

    return match;
  }

  async submitScore(userId, matchId, data) {
    const { scoreChallenger, scoreOpponent } = data;
    if (scoreChallenger == null || scoreOpponent == null) {
      throw new error.NOTFOUNDERROR("scoreChallenger and scoreOpponent are required");
    }

    const match = await this.repo.findMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");

    const isChallenger = await this.teamRepo.findMember(match.challengerTeamId, userId);
    const isOpponent = await this.teamRepo.findMember(match.opponentTeamId, userId);

    if (!isChallenger && !isOpponent) {
      throw new error.UNAUTHORIZED("Not a participant in this match");
    }

    if (match.status !== "scheduled" && match.status !== "in_progress") {
      throw new error.UNAUTHORIZED("Match cannot be scored in current status");
    }

    const side = isChallenger ? "challenger" : "opponent";

    if (match.scoreSubmittedBy) {
      if (match.scoreSubmittedBy === side) {
        throw new error.ALLREADYEXIST("You already submitted the score");
      }

      const challengerScore = side === "challenger" ? scoreChallenger : match.scoreChallenger;
      const opponentScore = side === "opponent" ? scoreOpponent : match.scoreOpponent;

      if (challengerScore === match.scoreChallenger && opponentScore === match.scoreOpponent) {
        return await this._completeMatch(matchId, challengerScore, opponentScore);
      }

      return await this.repo.updateMatch(matchId, {
        scoreSubmittedBy: "staff",
        status: "score_pending",
      });
    }

    await this.repo.updateMatch(matchId, {
      scoreChallenger: scoreChallenger,
      scoreOpponent: scoreOpponent,
      scoreSubmittedBy: side,
      status: "in_progress",
    });

    return await this.repo.findMatchById(matchId);
  }

  async startMatch(userId, matchId) {
    const match = await this.repo.findMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");

    const isChallenger = await this.teamRepo.findMember(match.challengerTeamId, userId);
    const isOpponent = await this.teamRepo.findMember(match.opponentTeamId, userId);
    if (!isChallenger && !isOpponent) {
      throw new error.UNAUTHORIZED("Not a participant in this match");
    }
    if (match.status !== "scheduled") {
      throw new error.UNAUTHORIZED("Match can only be started from scheduled status");
    }

    return await this.repo.updateMatch(matchId, {
      status: "in_progress",
      startedAt: new Date(),
    });
  }

  async cancelMatch(userId, matchId) {
    const match = await this.repo.findMatchById(matchId);
    if (!match) throw new error.NOTFOUNDERROR("Match not found");

    const isChallenger = await this.teamRepo.findMember(match.challengerTeamId, userId);
    const isOpponent = await this.teamRepo.findMember(match.opponentTeamId, userId);
    if (!isChallenger && !isOpponent) {
      throw new error.UNAUTHORIZED("Not a participant in this match");
    }
    if (match.status === "completed") {
      throw new error.UNAUTHORIZED("Cannot cancel a completed match");
    }

    return await this.repo.updateMatch(matchId, { status: "cancelled" });
  }

  async _completeMatch(matchId, challengerScore, opponentScore) {
    const match = await this.repo.updateMatch(matchId, {
      status: "completed",
      scoreChallenger: challengerScore,
      scoreOpponent: opponentScore,
      completedAt: new Date(),
      scoreSubmittedBy: "both",
    });

    const challengerWon = challengerScore > opponentScore;
    const winnerId = challengerWon ? match.challengerTeamId : match.opponentTeamId;
    const loserId = challengerWon ? match.opponentTeamId : match.challengerTeamId;

    const winner = await this.repo.findTeamById(winnerId);
    const loser = await this.repo.findTeamById(loserId);

    const winnerMatches = await this.repo.countTeamMatches(winnerId);
    const loserMatches = await this.repo.countTeamMatches(loserId);

    const winnerK = winnerMatches < ESTABLISHED_THRESHOLD ? K_FACTOR_NEW : K_FACTOR_ESTABLISHED;
    const loserK = loserMatches < ESTABLISHED_THRESHOLD ? K_FACTOR_NEW : K_FACTOR_ESTABLISHED;

    const expectedWinner = this._expectedScore(loser.elo, winner.elo);
    const expectedLoser = this._expectedScore(winner.elo, loser.elo);

    const winnerNewElo = Math.max(Math.round(winner.elo + winnerK * (1 - expectedWinner)), ELO_FLOOR);
    const loserNewElo = Math.max(Math.round(loser.elo + loserK * (0 - expectedLoser)), ELO_FLOOR);

    await this.repo.updateTeamElo(winnerId, winnerNewElo);
    await this.repo.updateTeamElo(loserId, loserNewElo);

    return await this.repo.findMatchById(matchId);
  }

  _expectedScore(ratingA, ratingB) {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }
  async _checkCaptainAccess(teamId, userId) {
    const member = await this.teamRepo.findMember(teamId, userId);
    if (!member || (member.role !== "captain" && member.role !== "co_captain")) {
      throw new error.UNAUTHORIZED("Captain or co-captain access required");
    }
    return member;
  }

  async _checkMemberAccess(teamId, userId) {
    const member = await this.teamRepo.findMember(teamId, userId);
    if (!member) throw new error.UNAUTHORIZED("Not a member of this team");
    return member;
  }
}
