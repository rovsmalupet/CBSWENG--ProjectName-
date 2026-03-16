import { loginUser, registerUser } from "../services/userAccountService.js";

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
