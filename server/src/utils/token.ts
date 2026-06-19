import crypto from "node:crypto";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type JwtPayload = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

export function signJwt(payload: JwtPayload) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };
  return jwt.sign(payload, env.jwtSecret as Secret, options);
}

export function verifyJwt(token: string) {
  return jwt.verify(token, env.jwtSecret) as JwtPayload;
}

export function createOpaqueToken() {
  return crypto.randomBytes(32).toString("hex");
}
