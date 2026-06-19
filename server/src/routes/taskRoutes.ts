import { Router } from "express";
import { z } from "zod";
import {
  archiveTask,
  createTask,
  deleteTask,
  exportCsv,
  exportPdf,
  listTasks,
  restoreTask,
  updateTask
} from "../controllers/taskController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const taskBody = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(3000).optional().default(""),
  priority: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
  status: z.enum(["pending", "completed", "archived"]).optional().default("pending"),
  tags: z.array(z.string().min(1).max(32)).optional().default([]),
  dueDate: z.coerce.date().optional(),
  category: z.string().max(80).optional().default("General"),
  reminder: z.coerce.date().optional(),
  notes: z.string().max(3000).optional().default(""),
  order: z.number().optional(),
  timeSpent: z.number().min(0).optional()
});

const taskPatchBody = taskBody.partial();

router.use(authenticate);

router.get(
  "/",
  validate(
    z.object({
      query: z.object({
        search: z.string().optional(),
        status: z.enum(["pending", "completed", "archived"]).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        tag: z.string().optional(),
        category: z.string().optional(),
        sort: z.string().optional(),
        page: z.coerce.number().min(1).optional(),
        limit: z.coerce.number().min(1).max(100).optional()
      })
    })
  ),
  listTasks
);
router.get("/export/csv", exportCsv);
router.get("/export/pdf", exportPdf);
router.post("/", validate(z.object({ body: taskBody })), createTask);
router.patch("/:id", validate(z.object({ body: taskPatchBody, params: z.object({ id: z.string() }) })), updateTask);
router.delete("/:id", validate(z.object({ params: z.object({ id: z.string() }) })), deleteTask);
router.patch("/:id/archive", validate(z.object({ params: z.object({ id: z.string() }) })), archiveTask);
router.patch("/:id/restore", validate(z.object({ params: z.object({ id: z.string() }) })), restoreTask);

export default router;
