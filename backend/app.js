import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import assignmentRoutes from "./routes/assignmentRoutes.js";
import marksRoutes from "./routes/marksRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(helmet());
if (process.env.NODE_ENV === "production") {
    app.use(morgan("combined"));
} else {
    app.use(morgan("dev"));
}

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { error: "Too many attempts, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Too many requests" },
    standardHeaders: true,
    legacyHeaders: false,
});

const rawFrontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const cleanFrontendUrl = rawFrontendUrl.endsWith("/") ? rawFrontendUrl.slice(0, -1) : rawFrontendUrl;

app.use(cors({
    origin: cleanFrontendUrl,
    credentials: true,
}));
app.use(express.json({ limit: "10mb" }));

app.set("trust proxy", 1);

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/students", apiLimiter, studentRoutes);
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/subjects", apiLimiter, subjectRoutes);
app.use("/api/exams", apiLimiter, examRoutes);
app.use("/api/assignments", apiLimiter, assignmentRoutes);
app.use("/api/marks", apiLimiter, marksRoutes);
app.use("/api/analytics", apiLimiter, analyticsRoutes);

app.get("/", (req, res) => {
    res.send("API running...");
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;