import * as assignmentService from "../services/assignmentService.js";

export const assignTeacher = async (req, res) => {
    try {
        const result = await assignmentService.assignTeacher(req.body);
        res.status(201).json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAssignments = async (req, res) => {
    try {
        const data = await assignmentService.getAssignments();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getTeacherAssignments = async (req, res) => {
    try {
        const data = await assignmentService.getTeacherAssignments(req.user.id);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};