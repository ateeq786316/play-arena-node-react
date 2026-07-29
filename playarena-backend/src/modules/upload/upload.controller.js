import UploadService from "./upload.service.js";
import prisma from "../../database/db.js";

export default class UploadController {
  constructor() {
    this.service = new UploadService();
  }

  async upload(req, res) {
    const result = await this.service.upload(req.file, req.params.type || "general", req.userId);
    res.status(201).json({ message: "File uploaded", ...result });
  }

  async uploadWithGroundAccess(req, res) {
    const result = await this.service.uploadWithGroundAccess(req.file, req.params.type, req.userId, req.params.groundId);
    res.status(201).json({ message: "File uploaded", ...result });
  }

  async uploadAvatar(req, res) {
    const result = await this.service.upload(req.file, "avatar", req.userId);
    if (result.url) {
      await prisma.user.update({ where: { id: req.userId }, data: { avatar: result.url } });
    }
    res.status(201).json({ message: "Avatar uploaded", ...result });
  }
}
