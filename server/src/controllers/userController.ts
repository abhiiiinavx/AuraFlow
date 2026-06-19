import type { Request, Response } from "express";
import { User, type UserDocument } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const publicProfile = (user: UserDocument) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    emailVerified: user.emailVerified,
    preferences: user.preferences,
    createdAt: user.createdAt
  };
};

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ user: publicProfile(user) });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const update = {
    name: req.body.name,
    avatar: req.body.avatar,
    preferences: req.body.preferences
  };

  const user = await User.findByIdAndUpdate(req.user?.id, update, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ user: publicProfile(user) });
});

export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw new ApiError(400, "Avatar file is required.");
  const avatar = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user?.id, { avatar }, { new: true });
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ user: publicProfile(user) });
});
