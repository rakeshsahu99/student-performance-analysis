import * as analyticsService from "../services/analyticsAccessService.js";

export const getStudentAnalytics = async (req, res) => {
    try {
        const data = await analyticsService.getStudentAnalytics(
            req.user,
            req.params.student_id
        );

        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getTeacherAnalytics = async (req, res) => {
    try {
        const data = await analyticsService.getTeacherAnalytics(req.user.id);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getSubjectStats = async (req, res) => {
    try {
        const data = await analyticsService.getSubjectStats(req.user.id);
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const getSubjectDetails = async (req, res) => {
    try {
        const data = await analyticsService.getSubjectDetails(
            req.user.id,
            req.params.id
        );
        res.json(data);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
