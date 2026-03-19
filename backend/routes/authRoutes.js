import express from "express";
import { login, register, forgotPassword, verifyToken, resetUserPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.get("/verify-reset-token", verifyToken);
router.post("/reset-password", resetUserPassword);

export default router;
