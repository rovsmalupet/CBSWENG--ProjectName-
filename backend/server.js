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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", authRoutes);
app.use("/posts", postRoutes);
app.use("/organizations", organizationRoutes);

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