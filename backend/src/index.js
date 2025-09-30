import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/users", userRoutes);

// health
app.get("/", (req, res) => res.send("🚀 LocalHands API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
