/**
 * authController.js
 *
 * Thin. Every controller here delegates to userAccountService and lets errors
 * propagate — Express 5 forwards a rejected promise from an async handler to
 * the central error handler automatically.
 *
 * That is the point: the previous version wrapped each function in try/catch
 * and responded with `res.status(500).json({ error: error.message })`, plus
 * `console.error("Stack trace:", error.stack)`. Any unexpected failure handed
 * the caller an internal message. There is now exactly one place that turns an
 * error into a response, and it is generic by construction. [2.4.1]
 */

import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  reauthenticate,
  changePassword,
  requestPasswordReset,
  verifyResetToken,
  verifyResetAnswers,
  resetPassword,
  updateSecurityAnswers,
} from "../services/userAccountService.js";
import { SECURITY_QUESTIONS } from "../security/securityQuestions.js";
import config from "../security/env.js";

/* ── Registration ─────────────────────────────────────────────────────────── */

/** Role is hard-coded, never read from the request body. */
export const registerDonor = async (req, res) => {
  const result = await registerUser({ ...req.body, role: "donor" }, req);
  res.status(201).json(result);
};

export const registerOrganization = async (req, res) => {
  const result = await registerUser({ ...req.body, role: "ngo" }, req);
  res.status(201).json(result);
};

/* ── Session ──────────────────────────────────────────────────────────────── */

export const login = async (req, res) => {
  const result = await loginUser(req.body, req);
  res.status(200).json(result);
};

export const logout = async (req, res) => {
  res.status(200).json(await logoutUser(req.user.accountId, req));
};

export const me = async (req, res) => {
  res.status(200).json(await getCurrentUser(req.user.accountId));
};

/* ── Critical operations [2.1.13] ─────────────────────────────────────────── */

export const reauth = async (req, res) => {
  const result = await reauthenticate(req.user.accountId, req.body.currentPassword, req);
  res.status(200).json(result);
};

export const changeOwnPassword = async (req, res) => {
  const result = await changePassword(req.user.accountId, req.body, req);
  res.status(200).json(result);
};

/* ── Password reset [2.1.9] ───────────────────────────────────────────────── */

export const forgotPassword = async (req, res) => {
  res.status(200).json(await requestPasswordReset(req.body, req));
};

export const verifyToken = async (req, res) => {
  res.status(200).json(await verifyResetToken(req.validated.query.token));
};

export const verifyAnswers = async (req, res) => {
  res.status(200).json(await verifyResetAnswers(req.body, req));
};

export const resetUserPassword = async (req, res) => {
  res.status(200).json(await resetPassword(req.body, req));
};

/* ── Security questions ───────────────────────────────────────────────────── */

/**
 * The question catalogue, for the registration form.
 *
 * Public because it is needed before an account exists. Returns question text
 * only — the rationales stay server-side, and no account is referenced, so this
 * reveals nothing about who is registered.
 */
export const listSecurityQuestions = async (req, res) => {
  res.status(200).json({
    questions: SECURITY_QUESTIONS.map((question) => ({
      key: question.key,
      text: question.text,
    })),
    required: config.securityQuestionCount,
  });
};

export const setSecurityQuestions = async (req, res) => {
  const result = await updateSecurityAnswers(req.user.accountId, req.body.securityAnswers, req);
  res.status(200).json(result);
};
