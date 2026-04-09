import express from "express";
import {
    register,
    login,
    requestPasswordReset,
    resetPassword,
} from "../controllers/authController.js";
import {
    validateLogin,
    validatePasswordReset,
    validatePasswordResetRequest,
    validateRegister,
} from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post(
    "/request-password-reset",
    validatePasswordResetRequest,
    requestPasswordReset
);
router.post("/reset-password", validatePasswordReset, resetPassword);

export default router;