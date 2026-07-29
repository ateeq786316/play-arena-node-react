import TeamRepo from "../../repository/team.repo.js";
import * as error from "../../shared/error/globalError.js";

export default class TeamService {
  constructor() {
    this.repo = new TeamRepo();
  }

  async createTeam(userId, data) {
    const { name, sport } = data;
    if (!name || !sport) throw new error.NOTFOUNDERROR("Team name and sport are required");

    const team = await this.repo.create({
      name,
      sport,
      cityId: data.cityId,
      logo: data.logo,
      description: data.description,
      captainId: userId,
    });

    await this.repo.addMember({
      teamId: team.id,
      userId,
      role: "captain",
    });

    return team;
  }

  async getTeamById(userId, teamId) {
    const team = await this.repo.findById(teamId);
    if (!team) throw new error.NOTFOUNDERROR("Team not found");

    const member = await this.repo.findMember(teamId, userId);
    if (!member) throw new error.UNAUTHORIZED("Not a member of this team");

    return team;
  }

  async listTeams(filters = {}) {
    return await this.repo.findAll(filters);
  }

  async listMyTeams(userId) {
    return await this.repo.findByPlayerId(userId);
  }

  async updateTeam(teamId, userId, data) {
    await this._checkCaptainAccess(teamId, userId);
    return await this.repo.update(teamId, data);
  }

  async deleteTeam(teamId, userId) {
    await this._checkCaptainAccess(teamId, userId);
    return await this.repo.softDelete(teamId);
  }

  async getTeamMembers(teamId, userId) {
    await this._checkMemberAccess(teamId, userId);
    const team = await this.repo.findById(teamId);
    return team?.members || [];
  }

  async updateMemberRole(teamId, userId, targetUserId, role) {
    await this._checkCaptainAccess(teamId, userId);

    if (userId === targetUserId) {
      throw new error.UNAUTHORIZED("Cannot change your own role");
    }

    const allowed = ["co_captain", "player"];
    if (!allowed.includes(role)) {
      throw new error.NOTFOUNDERROR("Invalid role. Allowed: co_captain, player");
    }

    return await this.repo.updateMember(teamId, targetUserId, { role });
  }

  async removeMember(teamId, userId, targetUserId) {
    await this._checkCaptainAccess(teamId, userId);

    if (userId === targetUserId) {
      throw new error.UNAUTHORIZED("Use transfer-captaincy to leave as captain");
    }

    return await this.repo.removeMember(teamId, targetUserId);
  }

  async leaveTeam(teamId, userId) {
    const member = await this.repo.findMember(teamId, userId);
    if (!member) throw new error.NOTFOUNDERROR("Not a member of this team");

    if (member.role === "captain") {
      throw new error.UNAUTHORIZED("Transfer captaincy before leaving");
    }

    return await this.repo.removeMember(teamId, userId);
  }

  async transferCaptaincy(teamId, userId, targetUserId) {
    await this._checkCaptainAccess(teamId, userId);

    if (userId === targetUserId) {
      throw new error.UNAUTHORIZED("Already the captain");
    }

    const target = await this.repo.findMember(teamId, targetUserId);
    if (!target) throw new error.NOTFOUNDERROR("Target user is not a member");

    await this.repo.updateMember(teamId, userId, { role: "co_captain" });
    await this.repo.updateMember(teamId, targetUserId, { role: "captain" });
    await this.repo.update(teamId, { captainId: targetUserId });

    return { message: "Captaincy transferred" };
  }

  async invitePlayer(teamId, userId, data) {
    await this._checkCaptainAccess(teamId, userId);

    const { targetUserId } = data;
    if (!targetUserId) throw new error.NOTFOUNDERROR("targetUserId is required");

    const existing = await this.repo.findMember(teamId, targetUserId);
    if (existing) throw new error.ALLREADYEXIST("User is already a member");

    const existingInvite = await this.repo.findInvite(teamId, targetUserId);
    if (existingInvite && existingInvite.status === "pending") {
      throw new error.ALLREADYEXIST("Invite already pending");
    }

    return await this.repo.createInvite({
      teamId,
      invitedById: userId,
      userId: targetUserId,
      status: "pending",
    });
  }

  async acceptInvite(teamId, userId) {
    const invite = await this.repo.findInvite(teamId, userId);
    if (!invite || invite.status !== "pending") {
      throw new error.NOTFOUNDERROR("No pending invite found");
    }

    await this.repo.updateInvite(teamId, userId, { status: "accepted" });
    await this.repo.addMember({ teamId, userId, role: "player" });

    return { message: "Joined team" };
  }

  async rejectInvite(teamId, userId) {
    const invite = await this.repo.findInvite(teamId, userId);
    if (!invite || invite.status !== "pending") {
      throw new error.NOTFOUNDERROR("No pending invite found");
    }

    await this.repo.updateInvite(teamId, userId, { status: "rejected" });
    return { message: "Invite rejected" };
  }

  async requestToJoin(teamId, userId) {
    const existing = await this.repo.findMember(teamId, userId);
    if (existing) throw new error.ALLREADYEXIST("Already a member");

    const existingReq = await this.repo.findJoinRequest(teamId, userId);
    if (existingReq && existingReq.status === "pending") {
      throw new error.ALLREADYEXIST("Join request already pending");
    }

    return await this.repo.createJoinRequest({ teamId, userId });
  }

  async listJoinRequests(teamId, userId) {
    await this._checkCaptainAccess(teamId, userId);
    return await this.repo.findJoinRequestsByTeam(teamId);
  }

  async acceptJoinRequest(teamId, userId, targetUserId) {
    await this._checkCaptainAccess(teamId, userId);

    const req = await this.repo.findJoinRequest(teamId, targetUserId);
    if (!req || req.status !== "pending") {
      throw new error.NOTFOUNDERROR("No pending join request found");
    }

    await this.repo.updateJoinRequest(teamId, targetUserId, { status: "accepted" });
    await this.repo.addMember({ teamId, userId: targetUserId, role: "player" });

    return { message: "Join request accepted" };
  }

  async rejectJoinRequest(teamId, userId, targetUserId) {
    await this._checkCaptainAccess(teamId, userId);

    const req = await this.repo.findJoinRequest(teamId, targetUserId);
    if (!req || req.status !== "pending") {
      throw new error.NOTFOUNDERROR("No pending join request found");
    }

    await this.repo.updateJoinRequest(teamId, targetUserId, { status: "rejected" });
    return { message: "Join request rejected" };
  }

  async getTeamStats(teamId, userId) {
    await this._checkMemberAccess(teamId, userId);
    const team = await this.repo.findById(teamId);
    return {
      totalMembers: team?._count?.members || 0,
      elo: team?.elo || 1200,
    };
  }

  async getRatingHistory(teamId, userId) {
    await this._checkMemberAccess(teamId, userId);
    return await this.repo.findRatingHistory(teamId);
  }

  async listSportCategories() {
    return await this.repo.findSportCategories();
  }

  async _checkCaptainAccess(teamId, userId) {
    const member = await this.repo.findMember(teamId, userId);
    if (!member || (member.role !== "captain" && member.role !== "co_captain")) {
      throw new error.UNAUTHORIZED("Captain or co-captain access required");
    }
    return member;
  }

  async _checkMemberAccess(teamId, userId) {
    const member = await this.repo.findMember(teamId, userId);
    if (!member) throw new error.UNAUTHORIZED("Not a member of this team");
    return member;
  }
}
