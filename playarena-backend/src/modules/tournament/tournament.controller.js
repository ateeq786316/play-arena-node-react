import TournamentService from "./tournament.service.js";

export default class TournamentController {
  constructor() {
    this.service = new TournamentService();
  }

  async createTournament(req, res) {
    const tournament = await this.service.createTournament(req.userId, req.body);
    res.status(201).json({ message: "Tournament created", tournament });
  }

  async listTournaments(req, res) {
    const filters = {};
    if (req.query.sport) filters.sport = req.query.sport;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.format) filters.format = req.query.format;
    const tournaments = await this.service.listTournaments(filters);
    res.status(200).json({ tournaments });
  }

  async getMyTournaments(req, res) {
    const tournaments = await this.service.getMyTournaments(req.userId);
    res.status(200).json({ tournaments });
  }

  async getTournamentById(req, res) {
    const tournament = await this.service.getTournamentById(req.params.id);
    res.status(200).json({ tournament });
  }

  async updateTournament(req, res) {
    const tournament = await this.service.updateTournament(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Tournament updated", tournament });
  }

  async deleteTournament(req, res) {
    await this.service.deleteTournament(req.params.id, req.userId);
    res.status(200).json({ message: "Tournament deleted" });
  }

  async registerTeam(req, res) {
    const result = await this.service.registerTeam(req.params.id, req.userId, req.body);
    res.status(201).json({ message: "Team registered", result });
  }

  async withdrawTeam(req, res) {
    const result = await this.service.withdrawTeam(req.params.id, req.userId, req.body);
    res.status(200).json(result);
  }

  async getBracket(req, res) {
    const bracket = await this.service.getBracket(req.params.id);
    res.status(200).json(bracket);
  }

  async getStandings(req, res) {
    const standings = await this.service.getStandings(req.params.id);
    res.status(200).json({ standings });
  }

  async enterMatchResult(req, res) {
    const result = await this.service.enterMatchResult(req.params.id, req.params.matchId, req.userId, req.body);
    res.status(200).json({ message: "Result recorded", result });
  }

  async generateBracket(req, res) {
    const result = await this.service.generateBracket(req.params.id, req.userId);
    res.status(200).json(result);
  }
}
