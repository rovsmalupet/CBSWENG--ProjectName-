import { loginUser, registerUser, requestPasswordReset, verifyResetToken, resetPassword } from "../services/userAccountService.js";

export const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Failed to register user." });
  }
};

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to login." });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to process password reset request." });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { token } = req.query;
    const result = await verifyResetToken(token);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(500).json({ error: "Failed to verify reset token." });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const result = await resetPassword(req.body);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};
