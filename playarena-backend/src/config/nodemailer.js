import nodemailer from "nodemailer";
import env from "./env.js";
import logger from "./logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export default async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    logger.info({ to, subject }, "Email sent successfully");
  } catch (error) {
    logger.error({ error, to, subject }, "Failed to send email");
    throw error;
  }
}
