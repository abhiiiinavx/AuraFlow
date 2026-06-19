import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDatabase() {
  if (!env.mongoUri) {
    console.warn("MONGO_URI is not configured. API routes that need persistence will return database errors.");
    return false;
  }

  await mongoose.connect(env.mongoUri, {
    autoIndex: true
  });

  console.log("MongoDB connected");
  return true;
}
