import express from "express";
import {
    addMarks,
    updateMarks,
    getAllMarks,
    getTeacherMarks,
    getMarksSummary,
} from "../controllers/marksController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isTeacher, isAdminOrTeacher } from "../middleware/roleMiddleware.js";
import {
    validateMarksCreate,
    validateMarksUpdate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isTeacher, validateMarksCreate, addMarks);
router.put("/:id", verifyToken, isTeacher, validateMarksUpdate, updateMarks);

router.get("/", verifyToken, isAdminOrTeacher, getAllMarks);
router.get("/teacher-view", verifyToken, isTeacher, getTeacherMarks);
router.get("/summary", verifyToken, isAdminOrTeacher, getMarksSummary);

export default router;