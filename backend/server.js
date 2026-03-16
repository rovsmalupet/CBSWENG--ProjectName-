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

// CORS Configuration - Support both local development and production
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173", // Vite default
  process.env.FRONTEND_URL, // Production frontend URL from env
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/organizations", organizationRoutes);

// Health check endpoint for deployment verification
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", environment: process.env.NODE_ENV || "development" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(port, async () => {
  try {
    await seedDefaultUsers();
    console.log("Auth seed ready: admin@bayanihub.local / donor@bayanihub.local");
  } catch (error) {
    console.error("Auth bootstrap warning:", error.message);
  }
  console.log(`Server running on port ${port}`);
});
