import * as marksService from "../services/marksService.js";

export const addMarks = async (req, res, next) => {
    try {
        const result = await marksService.addMarks(req.user, req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
};

export const updateMarks = async (req, res, next) => {
    try {
        const result = await marksService.updateMarks(
            req.user,
            req.params.id,
            req.body
        );
        res.json(result);
    } catch (err) {
        next(err);
    }
};

export const getAllMarks = async (req, res, next) => {
    try {
        const data = await marksService.getAllMarks();
        res.json(data);
    } catch (err) {
        next(err);
    }
};

export const getMarksSummary = async (req, res, next) => {
    try {
        const data = await marksService.getMarksSummary();
        res.json(data);
    } catch (err) {
        next(err);
    }
};