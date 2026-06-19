import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 8080),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  mongoUri: process.env.MONGO_URI ?? "",
  jwtSecret:
    process.env.JWT_SECRET ??
    "development-secret-change-before-production-change-before-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  emailFrom: process.env.EMAIL_FROM ?? "Aura Task Suite <noreply@example.com>",
  smtp: {
    host: process.env.SMTP_HOST ?? "",
    port: toNumber(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? ""
  },
  openAiKey: process.env.OPENAI_API_KEY ?? "",
  geminiKey: process.env.GEMINI_API_KEY ?? "",
  aiProvider: process.env.AI_PROVIDER ?? "mock"
};
