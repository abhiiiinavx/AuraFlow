import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtp = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

export async function sendMail(options: { to: string; subject: string; text: string; html?: string }) {
  if (!hasSmtp) {
    console.log(`[mail:dev] ${options.subject} -> ${options.to}\n${options.text}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass
    }
  });

  await transporter.sendMail({
    from: env.emailFrom,
    ...options
  });
}
