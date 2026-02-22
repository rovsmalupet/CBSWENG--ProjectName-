import express from "express";
import mongoose from "mongoose";
import postRoutes from "./routes/postRoutes.js";

const app = express();
const port = 3000;

// MongoDB connection (Mongoose v7+)
mongoose
  .connect("mongodb://127.0.0.1:27017/CBSWENG1")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/posts", postRoutes);

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));
