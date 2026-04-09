import express from "express";
import {
    createTeacher,
    getAllTeachers,
} from "../controllers/userController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/teachers", verifyToken, isAdmin, createTeacher);
router.get("/teachers", verifyToken, isAdmin, getAllTeachers);

export default router;