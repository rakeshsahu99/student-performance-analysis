import * as examService from "../services/examService.js";

export const getExams = async (req, res) => {
    try {
        const exams = await examService.getExams();
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};