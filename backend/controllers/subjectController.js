import * as subjectService from "../services/subjectService.js";

export const getSubjects = async (req, res) => {
    try {
        const subjects = await subjectService.getSubjects();
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};