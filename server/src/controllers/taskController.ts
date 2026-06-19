import type { Request, Response } from "express";
import type { Server } from "socket.io";
import { Notification } from "../models/Notification.js";
import { Task, type ITask } from "../models/Task.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { tasksToCsv } from "../utils/csv.js";
import { createTaskPdf } from "../utils/pdf.js";
import { emitToUser } from "../sockets/socketServer.js";

function getIo(req: Request) {
  return req.app.get("io") as Server | undefined;
}

async function notify(req: Request, message: string, type: "info" | "success" | "warning" | "deadline", taskId?: string) {
  if (!req.user) return;
  const notification = await Notification.create({
    userId: req.user.id,
    message,
    type,
    taskId
  });
  const io = getIo(req);
  if (io) emitToUser(io, req.user.id, "notification:new", notification);
}

function queryFilter(req: Request) {
  const filter: Record<string, unknown> = {
    userId: req.user?.id
  };

  const { search, status, priority, tag, category } = req.query;
  if (status) filter.status = status;
  if (!status) filter.status = { $ne: "archived" };
  if (priority) filter.priority = priority;
  if (tag) filter.tags = tag;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: String(search) };

  return filter;
}

export const listTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Math.min(Number(req.query.limit ?? 24), 100);
  const skip = (page - 1) * limit;
  const sort = String(req.query.sort ?? "-updatedAt");
  const filter = queryFilter(req);

  const [tasks, total] = await Promise.all([
    Task.find(filter).sort(sort).skip(skip).limit(limit),
    Task.countDocuments(filter)
  ]);

  res.json({
    tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.create({
    ...req.body,
    userId: req.user?.id
  });

  await notify(req, `Created task: ${task.title}`, "success", task.id);
  const io = getIo(req);
  if (io && req.user) emitToUser(io, req.user.id, "task:created", task);

  res.status(201).json({ task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const before = await Task.findOne({ _id: req.params.id, userId: req.user?.id });
  if (!before) throw new ApiError(404, "Task not found.");

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { $set: req.body },
    { new: true, runValidators: true }
  );

  if (!task) throw new ApiError(404, "Task not found.");

  if (before.status !== "completed" && task.status === "completed") {
    await notify(req, `Completed task: ${task.title}`, "success", task.id);
  }

  const io = getIo(req);
  if (io && req.user) emitToUser(io, req.user.id, "task:updated", task);
  res.json({ task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
  if (!task) throw new ApiError(404, "Task not found.");

  await notify(req, `Deleted task: ${task.title}`, "warning");
  const io = getIo(req);
  if (io && req.user) emitToUser(io, req.user.id, "task:deleted", { id: task.id });
  res.json({ message: "Task deleted." });
});

export const archiveTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { status: "archived" },
    { new: true }
  );
  if (!task) throw new ApiError(404, "Task not found.");

  await notify(req, `Archived task: ${task.title}`, "info", task.id);
  const io = getIo(req);
  if (io && req.user) emitToUser(io, req.user.id, "task:updated", task);
  res.json({ task });
});

export const restoreTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { status: "pending" },
    { new: true }
  );
  if (!task) throw new ApiError(404, "Task not found.");

  await notify(req, `Restored task: ${task.title}`, "success", task.id);
  const io = getIo(req);
  if (io && req.user) emitToUser(io, req.user.id, "task:updated", task);
  res.json({ task });
});

export const exportCsv = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await Task.find({ userId: req.user?.id }).sort("-createdAt");
  res.header("Content-Type", "text/csv");
  res.attachment("aura-tasks.csv");
  res.send(tasksToCsv(tasks as ITask[]));
});

export const exportPdf = asyncHandler(async (req: Request, res: Response) => {
  const tasks = await Task.find({ userId: req.user?.id }).sort("-createdAt");
  const pdf = createTaskPdf(tasks as ITask[]);
  res.header("Content-Type", "application/pdf");
  res.attachment("aura-tasks.pdf");
  res.send(pdf);
});
