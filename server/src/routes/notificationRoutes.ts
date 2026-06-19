import { Router } from "express";
import { z } from "zod";
import { listNotifications, markAllRead, markRead } from "../controllers/notificationController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);
router.get("/", listNotifications);
router.patch("/read-all", markAllRead);
router.patch("/:id/read", validate(z.object({ params: z.object({ id: z.string() }) })), markRead);

export default router;
