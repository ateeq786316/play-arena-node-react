import UploadRepo from "../../repository/upload.repo.js";
import * as error from "../../shared/error/globalError.js";
import prisma from "../../database/db.js";

const MIME_MAP = {
  "image/jpeg": true,
  "image/png": true,
  "image/webp": true,
  "application/pdf": true,
};

const FOLDER_MAP = {
  avatar: "avatars",
  "booking-proof": "bookings",
  "ground-image": "grounds",
  "team-logo": "teams",
  "tournament-poster": "tournaments",
  general: "general",
};

const RULES = {
  avatar: { mime: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024, auth: "jwt" },
  "booking-proof": { mime: ["image/jpeg", "image/png", "image/webp", "application/pdf"], maxSize: 10 * 1024 * 1024, auth: "staff" },
  "ground-image": { mime: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024, auth: "owner" },
  "team-logo": { mime: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024, auth: "jwt" },
  "tournament-poster": { mime: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024, auth: "owner" },
  general: { mime: ["image/jpeg", "image/png", "image/webp", "application/pdf"], maxSize: 10 * 1024 * 1024, auth: "jwt" },
};

export default class UploadService {
  constructor() {
    this.repo = new UploadRepo();
  }

  async upload(file, type, userId) {
    const rule = RULES[type] || RULES.general;
    const folder = FOLDER_MAP[type] || "general";

    if (!file) throw new error.NOTFOUNDERROR("No file provided");
    if (!rule.mime.includes(file.mimetype)) {
      throw new error.NOTFOUNDERROR(`Invalid file type. Allowed: ${rule.mime.join(", ")}`);
    }
    if (file.size > rule.maxSize) {
      throw new error.NOTFOUNDERROR(`File too large. Max: ${rule.maxSize / 1024 / 1024}MB`);
    }

    const url = await this.repo.uploadFile(file.buffer, file.originalname, file.mimetype, folder);

    return { url, type, folder, fileName: file.originalname };
  }

  async uploadWithGroundAccess(file, type, userId, groundId) {
    if (groundId) {
      const ground = await prisma.ground.findUnique({ where: { id: groundId } });
      if (!ground) throw new error.NOTFOUNDERROR("Ground not found");
      if (ground.ownerId !== userId) {
        const access = await prisma.groundAccess.findUnique({
          where: { groundId_userId: { groundId, userId } },
        });
        if (!access || (access.accessRole !== "owner" && access.accessRole !== "manager")) {
          throw new error.UNAUTHORIZED("Owner or manager access required");
        }
      }
    }
    return await this.upload(file, type, userId);
  }
}
