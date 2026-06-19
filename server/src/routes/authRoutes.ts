import { Router } from "express";
import { z } from "zod";
import { forgotPassword, login, logout, me, register, resetPassword, verifyEmail } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

const authBody = {
  email: z.string().email(),
  password: z.string().min(8)
};

router.post(
  "/register",
  validate(
    z.object({
      body: z.object({
        name: z.string().min(2).max(80),
        ...authBody
      })
    })
  ),
  register
);

router.post("/login", validate(z.object({ body: z.object(authBody) })), login);
router.post("/forgot-password", validate(z.object({ body: z.object({ email: z.string().email() }) })), forgotPassword);
router.post(
  "/reset-password",
  validate(z.object({ body: z.object({ token: z.string().min(16), password: z.string().min(8) }) })),
  resetPassword
);
router.post("/verify-email", validate(z.object({ body: z.object({ token: z.string().min(16) }) })), verifyEmail);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, logout);

export default router;
