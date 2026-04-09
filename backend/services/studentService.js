import sql from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

export const createStudent = async ({
    name,
    email,
    password,
    roll_number,
    class: studentClass,
}) => {
    const existing = await sql`
      SELECT * FROM students WHERE roll_number = ${roll_number}
    `;

    if (existing.length > 0) {
        throw new Error("Roll number already exists");
    }

    const hashedPassword = await hashPassword(password);

    const user = await sql`
      INSERT INTO users (name, email, password, role)
      VALUES (${name}, ${email}, ${hashedPassword}, 'student')
      RETURNING id
    `;

    const userId = user[0].id;

    const student = await sql`
      INSERT INTO students (user_id, roll_number, class)
      VALUES (${userId}, ${roll_number}, ${studentClass})
      RETURNING *
    `;

    return student[0];
};

export const getAllStudents = async () => {
    return await sql`
    SELECT s.*, u.name, u.email
    FROM students s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
    `;
};

export const getStudentByUserId = async (userId) => {
    const students = await sql`
    SELECT s.*, u.name, u.email
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ${userId}
    `;

    return students[0] || null;
};

export const updateStudent = async (id, data) => {
    const { name, email, roll_number, class: studentClass } = data;

    if (roll_number) {
        const existing = await sql`
      SELECT * FROM students
      WHERE roll_number = ${roll_number} AND id != ${id}
    `;

        if (existing.length > 0) {
            throw new Error("Roll number already exists");
        }
    }

    await sql`
    UPDATE students
    SET roll_number = COALESCE(${roll_number}, roll_number),
        class = COALESCE(${studentClass}, class)
    WHERE id = ${id}
    `;

    await sql`
    UPDATE users
    SET name = COALESCE(${name}, name),
        email = COALESCE(${email}, email)
    WHERE id = (SELECT user_id FROM students WHERE id = ${id})
    `;

    return { message: "Student updated successfully" };
};

export const deleteStudent = async (id) => {
    await sql`
    DELETE FROM users
    WHERE id = (SELECT user_id FROM students WHERE id = ${id})
    `;
};
