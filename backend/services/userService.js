import sql from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

export const createTeacher = async ({ name, email, password }) => {
    // Check if email exists
    const existing = await sql`
    SELECT * FROM users WHERE email = ${email}
  `;

    if (existing.length > 0) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await hashPassword(password);

    const result = await sql`
    INSERT INTO users (name, email, password, role)
    VALUES (${name}, ${email}, ${hashedPassword}, 'teacher')
    RETURNING id, name, email, role
  `;

    return result[0];
};

export const getAllTeachers = async () => {
    const teachers = await sql`
    SELECT id, name, email, role
    FROM users
    WHERE role = 'teacher'
    ORDER BY id DESC
  `;

    return teachers;
};
