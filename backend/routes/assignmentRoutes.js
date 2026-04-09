import express from "express";
import {
    assignTeacher,
    getAssignments,
    getTeacherAssignments,
} from "../controllers/assignmentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin, isTeacher } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, assignTeacher);
router.get("/", verifyToken, isAdmin, getAssignments);
router.get("/my", verifyToken, isTeacher, getTeacherAssignments);

export default router;