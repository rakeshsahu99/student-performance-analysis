import pool from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorMiddleware.js";

export const createAdmin = async ({ name, email, password }) => {
    const existing = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        throw new AppError("Email already exists", 409);
    }

    const hashed = await hashPassword(password);

    const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashed, 'admin']
    );

    return result.rows[0];
};

export const registerUser = async ({ name, email, password, role }) => {
    const existing = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );

    if (existing.rows.length > 0) {
        throw new AppError("Email already exists", 409);
    }

    const normalizedRole = role?.trim().toLowerCase() || "student";

    // Public signup must never be allowed to mint privileged accounts.
    if (normalizedRole !== "student") {
        throw new AppError("Only student self-registration is allowed", 403);
    }

    const hashed = await hashPassword(password);

    const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [name, email, hashed, normalizedRole]
    );

    return result.rows[0];
};

export const loginUser = async ({ email, password, rollNumber, role }) => {
    let user;

    if (role === "student") {
        const students = await pool.query(
            'SELECT u.*, s.roll_number as student_roll_number FROM users u JOIN students s ON u.id = s.user_id WHERE s.roll_number = $1',
            [rollNumber]
        );

        if (students.rows.length === 0) {
            throw new AppError("Invalid credentials", 401);
        }
        user = students.rows[0];
    } else {
        const users = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND role = $2',
            [email, role]
        );

        if (users.rows.length === 0) {
            throw new AppError("Invalid credentials", 401);
        }
        user = users.rows[0];
    }

    const isValid = await comparePassword(password, user.password);

    if (!isValid) {
        throw new AppError("Invalid credentials", 401);
    }

    const token = generateToken(user);
    const normalizedRole = user.role?.trim().toLowerCase();

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: normalizedRole,
            rollNumber: user.student_roll_number || null,
        },
    };
};

export const requestPasswordReset = async ({ email }) => {
    const users = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );

    // Always return a generic success response to avoid account enumeration.
    if (users.rows.length === 0) {
        return { message: "If the account exists, reset instructions have been sent." };
    }

    const resetToken = jwt.sign(
        { email, purpose: "password_reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );

    const response = {
        message: "If the account exists, reset instructions have been sent.",
    };

    // Temporary developer fallback until email delivery is integrated.
    if (process.env.NODE_ENV !== "production") {
        response.resetToken = resetToken;
    }

    return response;
};

export const resetPasswordWithToken = async ({ token, password }) => {
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        throw new AppError("Invalid or expired reset token", 401);
    }

    if (!decoded?.email || decoded?.purpose !== "password_reset") {
        throw new AppError("Invalid reset token", 401);
    }

    const hashed = await hashPassword(password);

    const updated = await pool.query(
        'UPDATE users SET password = $1 WHERE email = $2 RETURNING id',
        [hashed, decoded.email]
    );

    if (updated.rows.length === 0) {
        throw new AppError("Invalid reset token", 401);
    }

    return { message: "Password updated successfully" };
};
