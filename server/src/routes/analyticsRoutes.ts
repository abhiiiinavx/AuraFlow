import { Router } from "express";
import { analyticsSummary } from "../controllers/analyticsController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/summary", authenticate, analyticsSummary);

export default router;
