import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import postRoutes from "./routes/postRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { seedDefaultUsers } from "./services/userAccountService.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS — allow requests from local dev and the deployed frontend
// VITE_API_URL should be set in your Railway environment variables
const allowedOrigins = [
  "http://localhost:5173", // Vite local dev
  process.env.FRONTEND_URL, // deployed Vercel frontend URL
].filter(Boolean); // filter out undefined if FRONTEND_URL isn't set yet

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Parse JSON and URL-encoded request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// authRoutes is mounted at "/" so /login and /register work at root level
app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/organizations", organizationRoutes);

// Health check — useful for Railway and deployment verification
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    environment: process.env.NODE_ENV || "development",
  });
});

// Global error handler — catches any unhandled errors from controllers
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler — catches any route that doesn't match
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, async () => {
  try {
    // Seeds default admin and donor accounts if they don't exist yet.
    // Safe to run on every restart — uses findUnique before creating.
    await seedDefaultUsers();
  } catch (error) {
    console.error("Seed warning:", error.message);
  }
  console.log(`Server running on port ${port}`);
});