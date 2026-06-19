import type { Request, Response } from "express";
import { Task } from "../models/Task.js";
import {
  detectPriority,
  generateTasksFromText,
  recommendNextTask,
  suggestSchedule,
  summarizeCompleted
} from "../services/aiService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateTasks = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await generateTasksFromText(req.body.text);
  res.json({ tasks });
});

export const priorityDetection = asyncHandler(async (req: Request, res: Response) => {
  const priority = await detectPriority(req.body.text);
  res.json({ priority });
});

export const scheduleSuggestion = asyncHandler(async (req: Request, res: Response) => {
  const suggestion = await suggestSchedule(req.body.text);
  res.json(suggestion);
});

export const nextTask = asyncHandler(async (req: Request, res: Response) => {
  const pending = await Task.find({ userId: req.user?.id, status: "pending" }).sort("dueDate");
  const recommendation = await recommendNextTask(
    pending.map((task) => ({ title: task.title, priority: task.priority, dueDate: task.dueDate }))
  );
  res.json(recommendation);
});

export const summarize = asyncHandler(async (req: Request, res: Response) => {
  const completed = await Task.find({ userId: req.user?.id, status: "completed" }).sort("-updatedAt").limit(40);
  const summary = await summarizeCompleted(completed.map((task) => ({ title: task.title, category: task.category })));
  res.json({ summary });
});
