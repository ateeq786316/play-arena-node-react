import jwt from "jsonwebtoken";
import env from "../config/env.js";
import { UNAUTHORIZED } from "../shared/error/globalError.js";

export default function authMiddleware(req, res, next) {
  const token = req.cookies?.accessToken;
  if (!token) throw new UNAUTHORIZED("Access token required");

  try {
    const decoded = jwt.verify(token, env.ACCESSTOKEN);
    req.userId = decoded.id;
    next();
  } catch {
    throw new UNAUTHORIZED("Invalid or expired token");
  }
}
