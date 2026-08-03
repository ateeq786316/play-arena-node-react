import prisma from "../database/db.js";
import { FORBIDDEN } from "../shared/error/globalError.js";

const ADMIN_ROLES = ["admin", "super_admin"];

export default async function requireAdmin(req, res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { role: true } });
  if (!user || !ADMIN_ROLES.includes(user.role)) {
    return next(new FORBIDDEN("Admin access required"));
  }
  next();
}
