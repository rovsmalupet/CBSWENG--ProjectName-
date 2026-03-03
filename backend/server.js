import express from "express";
import dotenv from "dotenv";
import postRoutes from "./routes/postRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/posts", postRoutes);

// Start server
app.listen(port, () => console.log(`Server running on port ${port}`));