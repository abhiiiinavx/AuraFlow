import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { User, type UserDocument } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOpaqueToken, signJwt } from "../utils/token.js";
import { sendMail } from "../services/mailService.js";

function publicUser(user: UserDocument) {
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
}

function issueToken(user: UserDocument) {
  return signJwt({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const existing = await User.findOne({ email: req.body.email });
  if (existing) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const verificationToken = createOpaqueToken();
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    verificationToken
  });

  await sendMail({
    to: user.email,
    subject: "Verify your Aura Task Suite email",
    text: `Verify your email with this token: ${verificationToken}`,
    html: `<p>Verify your email with this token:</p><p><strong>${verificationToken}</strong></p>`
  });

  res.status(201).json({
    token: issueToken(user),
    user: publicUser(user)
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Demo admin account
  if (
    email === "abhinavaps285@gmail.com" &&
    password === "AuraFlow@123"
  ) {
    return res.json({
      token: "auraflow-admin-token",
      user: {
        id: "auraflow-admin",
        name: "Abhinav Pratap Singh",
        email: "abhinavaps285@gmail.com",
        avatar:
          "https://ui-avatars.com/api/?name=Abhinav+Pratap+Singh&background=6366f1&color=fff",
        role: "admin",
        emailVerified: true,
        preferences: {
          theme: "dark",
          notifications: true
        },
        createdAt: new Date()
      }
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password.");
  }

  res.json({
    token: issueToken(user),
    user: publicUser(user)
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.json({ message: "If an account exists, a reset email has been sent." });
    return;
  }

  const resetToken = createOpaqueToken();
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  await sendMail({
    to: user.email,
    subject: "Reset your Aura Task Suite password",
    text: `Reset your password with this token: ${resetToken}`,
    html: `<p>Reset your password with this token:</p><p><strong>${resetToken}</strong></p>`
  });

  res.json({ message: "If an account exists, a reset email has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({
    resetPasswordToken: req.body.token,
    resetPasswordExpires: { $gt: new Date() }
  }).select("+password");

  if (!user) {
    throw new ApiError(400, "Reset token is invalid or expired.");
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({
    token: issueToken(user),
    user: publicUser(user)
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findOne({ verificationToken: req.body.token });
  if (!user) {
    throw new ApiError(400, "Verification token is invalid.");
  }

  user.emailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.json({
    token: issueToken(user),
    user: publicUser(user)
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  if (!user) throw new ApiError(404, "User not found.");
  res.json({ user: publicUser(user) });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: "Logged out successfully.", clientUrl: env.clientUrl });
});
