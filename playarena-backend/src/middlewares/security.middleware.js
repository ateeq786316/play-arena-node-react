import hpp from "hpp";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import express from "express";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import env from "../config/env.js";

export default function securityMiddleware(app) {
  app.use(morgan("dev"));
  app.use(express.json({ limit: "3mb" }));
  app.use(express.urlencoded({ extended: true, limit: "3mb" }));
  app.use(cookieParser());

  const corsOrigins = env.CORS_ORIGIN === "*"
    ? ["http://localhost:3000", "http://localhost:3001"]
    : env.CORS_ORIGIN.split(",").map((o) => o.trim());

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  );
  app.use(passport.initialize());
  app.use(hpp());
  app.use(helmet());
  app.use(compression());
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      message: "Too many requests, please try again later",
      limit: 500,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );
}
