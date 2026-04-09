import express from "express";
import { getExams } from "../controllers/examController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getExams);

export default router;