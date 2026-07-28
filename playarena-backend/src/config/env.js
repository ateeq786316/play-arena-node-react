import z from "zod";
import logger from "./logger.js";
import dotenv from "dotenv";
import constant from "../constant/app.constant.js";
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().default(constant.PORT),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  AWS_REGION: z.string().default("eu-north-1"),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().default("playarena-uploads-dev"),
  SMTP_HOST: z.string().default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  CORS_ORIGIN: z.string().default("*"),
  LOG_LEVEL: z.string().default("info"),
  BOOKING_EXPIRY_MINUTES: z.coerce.number().default(30),
  PAGINATION_DEFAULT_SIZE: z.coerce.number().default(20),
  REDIS_CACHE_TTL: z.coerce.number().default(300),
  GOOGLE_CALLBACK_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  ACCESSTOKEN: z.string(),
  REFRESHTOKEN: z.string(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error({ errors: parsed.error.errors }, "Invalid environment variables");
  process.exit(1);
}

export default parsed.data;
