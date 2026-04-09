import sql from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorMiddleware.js";

export const createAdmin = async ({ name, email, password }) => {
    const existing = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;

    if (existing.length > 0) {
        throw new AppError("Email already exists", 409);
    }

    const hashed = await hashPassword(password);

    const result = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashed}, 'admin')
    RETURNING id, name, email, role
  `;

    return result[0];
};

export const registerUser = async ({ name, email, password, role }) => {
    const existing = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;

    if (existing.length > 0) {
        throw new AppError("Email already exists", 409);
    }

    const normalizedRole = role?.trim().toLowerCase() || "student";

    // Public signup must never be allowed to mint privileged accounts.
    if (normalizedRole !== "student") {
        throw new AppError("Only student self-registration is allowed", 403);
    }

    const hashed = await hashPassword(password);

    const result = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashed}, ${normalizedRole})
    RETURNING id, name, email, role
  `;

    return result[0];
};

export const loginUser = async ({ email, password, rollNumber, role }) => {
    let user;
    
    if (role === "student") {
        const students = await sql`
            SELECT u.*, s.roll_number as student_roll_number
            FROM users u
            JOIN students s ON u.id = s.user_id
            WHERE s.roll_number = ${rollNumber}
        `;
        
        if (students.length === 0) {
            throw new AppError("Invalid credentials", 401);
        }
        user = students[0];
    } else {
        const users = await sql`
            SELECT * FROM users WHERE email = ${email} AND role = ${role}
        `;
        
        if (users.length === 0) {
            throw new AppError("Invalid credentials", 401);
        }
        user = users[0];
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
    const users = await sql`
    SELECT id FROM users WHERE email = ${email}
  `;

    // Always return a generic success response to avoid account enumeration.
    if (users.length === 0) {
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

    const updated = await sql`
    UPDATE users
    SET password = ${hashed}
    WHERE email = ${decoded.email}
    RETURNING id
  `;

    if (updated.length === 0) {
        throw new AppError("Invalid reset token", 401);
    }

    return { message: "Password updated successfully" };
};
