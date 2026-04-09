import express from "express";
import { getStudentAnalytics, getTeacherAnalytics, getSubjectStats, getSubjectDetails } from "../controllers/analyticsController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isTeacher, isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/teacher-view", verifyToken, isTeacher, getTeacherAnalytics);
router.get("/subject-stats", verifyToken, isTeacher, getSubjectStats);
router.get("/subject/:id", verifyToken, isTeacher, getSubjectDetails);
router.get("/:student_id", verifyToken, getStudentAnalytics);

export default router;
