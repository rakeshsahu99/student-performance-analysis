import express from "express";
import {
    createStudent,
    getAllStudents,
    getStudentByUserId,
    getStudentByRegdNo,
    updateStudent,
    deleteStudent,
} from "../controllers/studentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin, isAdminOrTeacher } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, createStudent);
router.get("/", verifyToken, isAdminOrTeacher, getAllStudents);
router.get("/me", verifyToken, getStudentByUserId);
router.get("/regd/:regd_no", verifyToken, isAdminOrTeacher, getStudentByRegdNo);
router.put("/:id", verifyToken, isAdmin, updateStudent);
router.delete("/:id", verifyToken, isAdmin, deleteStudent);

export default router;
