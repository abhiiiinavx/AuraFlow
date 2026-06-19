import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { verifyJwt } from "../utils/token.js";
import { User } from "../models/User.js";

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

    if (!token) {
      throw new ApiError(401, "Authentication token is required.");
    }

    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.id).select("name email role");

    if (!user) {
      throw new ApiError(401, "User no longer exists.");
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid or expired token."));
  }
}
