import type { Request, Response } from "express";
import { Notification } from "../models/Notification.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await Notification.find({ userId: req.user?.id }).sort("-createdAt").limit(50);
  res.json({ notifications });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, "Notification not found.");
  res.json({ notification });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ userId: req.user?.id, read: false }, { read: true });
  res.json({ message: "Notifications marked as read." });
});
