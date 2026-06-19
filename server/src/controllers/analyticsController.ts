import type { Request, Response } from "express";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { Task } from "../models/Task.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { summarizeCompleted } from "../services/aiService.js";

export const analyticsSummary = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await Task.find({ userId: req.user?.id });
  const completed = tasks.filter((task) => task.status === "completed");
  const pending = tasks.filter((task) => task.status === "pending");
  const archived = tasks.filter((task) => task.status === "archived");

  const completionRate = tasks.length ? Math.round((completed.length / tasks.length) * 100) : 0;
  const overdue = pending.filter((task) => task.dueDate && task.dueDate < new Date()).length;
  const productivityScore = Math.max(0, Math.min(100, completionRate + completed.length * 2 - overdue * 5));

  const lastSevenDays = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  });

  const weeklyProgress = lastSevenDays.map((day) => ({
    day: format(day, "EEE"),
    completed: completed.filter((task) => isSameDay(task.updatedAt, day)).length,
    created: tasks.filter((task) => isSameDay(task.createdAt, day)).length
  }));

  const priorityDistribution = ["Low", "Medium", "High"].map((priority) => ({
    name: priority,
    value: tasks.filter((task) => task.priority === priority).length
  }));

  const categoryDistribution = [...new Set(tasks.map((task) => task.category))].map((category) => ({
    name: category,
    value: tasks.filter((task) => task.category === category).length
  }));

  const monthlyReports = Array.from({ length: 6 }, (_value, index) => {
    const date = subDays(new Date(), index * 30);
    return {
      month: format(date, "MMM"),
      completed: completed.filter((task) => format(task.updatedAt, "MMM yyyy") === format(date, "MMM yyyy")).length
    };
  }).reverse();

  const completedDates = new Set(completed.map((task) => format(task.updatedAt, "yyyy-MM-dd")));
  let streak = 0;
  for (let index = 0; index < 30; index += 1) {
    const key = format(subDays(new Date(), index), "yyyy-MM-dd");
    if (!completedDates.has(key)) break;
    streak += 1;
  }

  res.json({
    stats: {
      total: tasks.length,
      completed: completed.length,
      pending: pending.length,
      archived: archived.length,
      overdue,
      completionRate,
      productivityScore,
      weeklyStreak: streak,
      timeSpent: tasks.reduce((sum, task) => sum + task.timeSpent, 0)
    },
    weeklyProgress,
    priorityDistribution,
    categoryDistribution,
    monthlyReports,
    recentActivity: tasks
      .slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 8)
      .map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        updatedAt: task.updatedAt
      })),
    upcomingDeadlines: pending
      .filter((task) => task.dueDate)
      .sort((a, b) => Number(a.dueDate) - Number(b.dueDate))
      .slice(0, 8),
    aiSummary: await summarizeCompleted(completed.map((task) => ({ title: task.title, category: task.category })))
  });
});
