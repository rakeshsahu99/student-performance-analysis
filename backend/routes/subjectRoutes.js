import express from "express";
import * as subjectController from "../controllers/subjectController.js";

const router = express.Router();

router.get("/", subjectController.getSubjects);

export default router;