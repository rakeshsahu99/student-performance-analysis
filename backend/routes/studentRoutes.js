import express from "express";
import {
    createStudent,
    getAllStudents,
    getStudentByUserId,
    updateStudent,
    deleteStudent,
} from "../controllers/studentController.js";

import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

const isAdminOrTeacher = (req, res, next) => {
    const userRole = req.user?.role;
    if (userRole === "admin" || userRole === "teacher") {
        next();
    } else {
        res.status(403).json({ error: "Access denied" });
    }
};

router.post("/", verifyToken, isAdmin, createStudent);
router.get("/", verifyToken, isAdminOrTeacher, getAllStudents);
router.get("/me", verifyToken, getStudentByUserId);
router.put("/:id", verifyToken, isAdmin, updateStudent);
router.delete("/:id", verifyToken, isAdmin, deleteStudent);

export default router;
