import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { getProfile, updateProfile, uploadAvatar } from "../controllers/userController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 2 * 1024 * 1024
  }
});

router.use(authenticate);
router.get("/profile", getProfile);
router.patch(
  "/profile",
  validate(
    z.object({
      body: z.object({
        name: z.string().min(2).max(80).optional(),
        avatar: z.string().url().optional(),
        preferences: z
          .object({
            theme: z.enum(["light", "dark", "system"]).optional(),
            compactMode: z.boolean().optional(),
            reminders: z.boolean().optional()
          })
          .optional()
      })
    })
  ),
  updateProfile
);
router.post("/avatar", upload.single("avatar"), uploadAvatar);

export default router;
