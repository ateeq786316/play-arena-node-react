import MatchService from "./match.service.js";

export default class MatchController {
  constructor() {
    this.service = new MatchService();
  }

  async createChallenge(req, res) {
    const challenge = await this.service.createChallenge(req.userId, { ...req.body, challengerTeamId: req.params.teamId });
    res.status(201).json({ message: "Challenge sent", challenge });
  }

  async getSentChallenges(req, res) {
    const challenges = await this.service.getSentChallenges(req.userId, req.params.teamId);
    res.status(200).json({ challenges });
  }

  async getReceivedChallenges(req, res) {
    const challenges = await this.service.getReceivedChallenges(req.userId, req.params.teamId);
    res.status(200).json({ challenges });
  }

  async acceptChallenge(req, res) {
    const match = await this.service.acceptChallenge(req.userId, req.params.id);
    res.status(200).json({ message: "Challenge accepted", match });
  }

  async rejectChallenge(req, res) {
    await this.service.rejectChallenge(req.userId, req.params.id);
    res.status(200).json({ message: "Challenge rejected" });
  }

  async cancelChallenge(req, res) {
    await this.service.cancelChallenge(req.userId, req.params.id);
    res.status(200).json({ message: "Challenge cancelled" });
  }

  async listMatches(req, res) {
    const matches = await this.service.listMatches(req.userId, req.params.teamId);
    res.status(200).json({ matches });
  }

  async getMatchDetail(req, res) {
    const match = await this.service.getMatchDetail(req.userId, req.params.id);
    res.status(200).json({ match });
  }

  async submitScore(req, res) {
    const match = await this.service.submitScore(req.userId, req.params.id, req.body);
    res.status(200).json({ message: "Score submitted", match });
  }

  async startMatch(req, res) {
    const match = await this.service.startMatch(req.userId, req.params.id);
    res.status(200).json({ message: "Match started", match });
  }

  async cancelMatch(req, res) {
    await this.service.cancelMatch(req.userId, req.params.id);
    res.status(200).json({ message: "Match cancelled" });
  }
}
