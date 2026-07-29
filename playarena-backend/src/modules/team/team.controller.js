import TeamService from "./team.service.js";

export default class TeamController {
  constructor() {
    this.service = new TeamService();
  }

  async createTeam(req, res) {
    const team = await this.service.createTeam(req.userId, req.body);
    res.status(201).json({ message: "Team created", team });
  }

  async getTeamById(req, res) {
    const team = await this.service.getTeamById(req.userId, req.params.id);
    res.status(200).json({ team });
  }

  async listTeams(req, res) {
    const filters = {};
    if (req.query.sport) filters.sport = req.query.sport;
    if (req.query.cityId) filters.cityId = req.query.cityId;
    const teams = await this.service.listTeams(filters);
    res.status(200).json({ teams });
  }

  async listMyTeams(req, res) {
    const teams = await this.service.listMyTeams(req.userId);
    res.status(200).json({ teams });
  }

  async updateTeam(req, res) {
    const team = await this.service.updateTeam(req.params.id, req.userId, req.body);
    res.status(200).json({ message: "Team updated", team });
  }

  async deleteTeam(req, res) {
    await this.service.deleteTeam(req.params.id, req.userId);
    res.status(200).json({ message: "Team deleted" });
  }

  async getTeamMembers(req, res) {
    const members = await this.service.getTeamMembers(req.params.id, req.userId);
    res.status(200).json({ members });
  }

  async updateMemberRole(req, res) {
    const result = await this.service.updateMemberRole(req.params.id, req.userId, req.params.uid, req.body.role);
    res.status(200).json({ message: "Role updated", result });
  }

  async removeMember(req, res) {
    await this.service.removeMember(req.params.id, req.userId, req.params.uid);
    res.status(200).json({ message: "Member removed" });
  }

  async leaveTeam(req, res) {
    await this.service.leaveTeam(req.params.id, req.userId);
    res.status(200).json({ message: "Left team" });
  }

  async transferCaptaincy(req, res) {
    const result = await this.service.transferCaptaincy(req.params.id, req.userId, req.params.uid);
    res.status(200).json(result);
  }

  async invitePlayer(req, res) {
    const invite = await this.service.invitePlayer(req.params.id, req.userId, req.body);
    res.status(201).json({ message: "Invite sent", invite });
  }

  async acceptInvite(req, res) {
    const result = await this.service.acceptInvite(req.params.id, req.userId);
    res.status(200).json(result);
  }

  async rejectInvite(req, res) {
    const result = await this.service.rejectInvite(req.params.id, req.userId);
    res.status(200).json(result);
  }

  async requestToJoin(req, res) {
    const request = await this.service.requestToJoin(req.params.id, req.userId);
    res.status(201).json({ message: "Join request sent", request });
  }

  async listJoinRequests(req, res) {
    const requests = await this.service.listJoinRequests(req.params.id, req.userId);
    res.status(200).json({ requests });
  }

  async acceptJoinRequest(req, res) {
    const result = await this.service.acceptJoinRequest(req.params.id, req.userId, req.params.uid);
    res.status(200).json(result);
  }

  async rejectJoinRequest(req, res) {
    const result = await this.service.rejectJoinRequest(req.params.id, req.userId, req.params.uid);
    res.status(200).json(result);
  }

  async getTeamStats(req, res) {
    const stats = await this.service.getTeamStats(req.params.id, req.userId);
    res.status(200).json({ stats });
  }

  async getRatingHistory(req, res) {
    const history = await this.service.getRatingHistory(req.params.id, req.userId);
    res.status(200).json({ history });
  }

  async listSportCategories(req, res) {
    const categories = await this.service.listSportCategories();
    res.status(200).json({ categories });
  }
}
