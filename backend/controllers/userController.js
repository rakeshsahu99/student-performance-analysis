import * as userService from "../services/userService.js";

export const createTeacher = async (req, res) => {
    try {
        const teacher = await userService.createTeacher(req.body);
        res.status(201).json(teacher);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await userService.getAllTeachers();
        res.json(teachers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};