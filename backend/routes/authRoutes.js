/**
 * Authentication routes.
 *
 * Note what is NOT here: no `authenticate`, no `authorizeRoles`. Authorization
 * for every one of these paths is declared in the policy table in
 * security/accessControl.js and enforced by the single middleware mounted in
 * server.js. Route files describe the shape of the API; they no longer make
 * security decisions. [CSSECDV 2.2.1]
 */

import express from "express";

import { validate } from "../middleware/validate.js";
import { authLimiter, resetLimiter } from "../middleware/rateLimit.js";
import {
  registerDonor,
  login,
  logout,
  me,
  reauth,
  changeOwnPassword,
  forgotPassword,
  verifyToken,
  verifyAnswers,
  resetUserPassword,
  listSecurityQuestions,
  setSecurityQuestions,
} from "../controllers/authController.js";
import {
  registerDonorSchema,
  loginSchema,
  reauthSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  verifyResetTokenSchema,
  verifyResetAnswersSchema,
  resetPasswordSchema,
  setSecurityQuestionsSchema,
} from "../schemas/auth.schema.js";
import { emptyRequestSchema } from "../schemas/common.js";

const router = express.Router();

// Rate limiting complements per-account lockout rather than duplicating it:
// lockout stops repeated guesses against ONE account, while a per-IP limit
// stops one guess against thousands of accounts (password spraying), which
// lockout cannot see. [2.1.8]
router.post("/register", authLimiter, validate(registerDonorSchema), registerDonor);
router.post("/login", authLimiter, validate(loginSchema), login);

router.post("/forgot-password", resetLimiter, validate(forgotPasswordSchema), forgotPassword);
router.get("/verify-reset-token", resetLimiter, validate(verifyResetTokenSchema), verifyToken);
router.post(
  "/reset-password/verify-answers",
  resetLimiter,
  validate(verifyResetAnswersSchema),
  verifyAnswers,
);
router.post("/reset-password", resetLimiter, validate(resetPasswordSchema), resetUserPassword);

router.get("/auth/me", validate(emptyRequestSchema), me);
router.post("/auth/logout", validate(emptyRequestSchema), logout);
router.post("/auth/reauth", authLimiter, validate(reauthSchema), reauth);
router.post("/auth/change-password", validate(changePasswordSchema), changeOwnPassword);

router.get("/auth/security-questions", validate(emptyRequestSchema), listSecurityQuestions);
router.post("/auth/security-questions", validate(setSecurityQuestionsSchema), setSecurityQuestions);

export default router;
