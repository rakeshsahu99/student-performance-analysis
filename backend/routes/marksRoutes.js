import express from "express";
import {
    addMarks,
    updateMarks,
    getAllMarks,
    getMarksSummary,
} from "../controllers/marksController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isTeacher } from "../middleware/roleMiddleware.js";
import {
    validateMarksCreate,
    validateMarksUpdate,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isTeacher, validateMarksCreate, addMarks);
router.put("/:id", verifyToken, isTeacher, validateMarksUpdate, updateMarks);

router.get("/", verifyToken, isTeacher, getAllMarks);
router.get("/summary", verifyToken, isTeacher, getMarksSummary);

export default router;