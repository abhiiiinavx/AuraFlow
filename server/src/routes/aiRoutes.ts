import { Router } from "express";
import { z } from "zod";
import { generateTasks, nextTask, priorityDetection, scheduleSuggestion, summarize } from "../controllers/aiController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const textBody = z.object({ text: z.string().min(3).max(5000) });

router.use(authenticate);
router.post("/generate-tasks", validate(z.object({ body: textBody })), generateTasks);
router.post("/detect-priority", validate(z.object({ body: textBody })), priorityDetection);
router.post("/schedule", validate(z.object({ body: textBody })), scheduleSuggestion);
router.post("/next-task", nextTask);
router.post("/summarize", summarize);

export default router;
