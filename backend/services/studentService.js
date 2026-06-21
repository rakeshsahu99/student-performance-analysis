import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

export const createStudent = async ({
    name,
    email,
    password,
    roll_number,
    branch: studentBranch,
}) => {
    const existing = await pool.query(
        'SELECT * FROM students WHERE roll_number = $1',
        [roll_number]
    );

    if (existing.rows.length > 0) {
        throw new Error("Roll number already exists");
    }

    const hashedPassword = await hashPassword(password);

    // Generate email from roll number if not provided (remove personal email)
    const studentEmail = email || `${roll_number}@students.local`;

    const user = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
        [name, studentEmail, hashedPassword, 'student']
    );

    const userId = user.rows[0].id;

    const student = await pool.query(
        'INSERT INTO students (user_id, roll_number, branch) VALUES ($1, $2, $3) RETURNING *',
        [userId, roll_number, studentBranch]
    );

    return student.rows[0];
};

export const getAllStudents = async () => {
    const result = await pool.query(
        'SELECT s.id, s.user_id, s.roll_number, s.regd_no, s.branch, u.name FROM students s JOIN users u ON s.user_id = u.id ORDER BY s.id DESC'
    );
    return result.rows;
};

export const getStudentByUserId = async (userId) => {
    const students = await pool.query(
        'SELECT s.id, s.user_id, s.roll_number, s.regd_no, s.branch, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.user_id = $1',
        [userId]
    );

    return students.rows[0] || null;
};

export const getStudentByRegdNo = async (regd_no) => {
    const students = await pool.query(
        'SELECT s.id, s.user_id, s.roll_number, s.regd_no, s.branch, u.name FROM students s JOIN users u ON s.user_id = u.id WHERE s.regd_no = $1 OR s.roll_number = $1',
        [regd_no]
    );

    return students.rows[0] || null;
};

export const updateStudent = async (id, data) => {
    const { name, roll_number, branch: studentBranch } = data;

    if (roll_number) {
        const existing = await pool.query(
            'SELECT * FROM students WHERE roll_number = $1 AND id != $2',
            [roll_number, id]
        );

        if (existing.rows.length > 0) {
            throw new Error("Roll number already exists");
        }
    }

    await pool.query(
        'UPDATE students SET roll_number = COALESCE($1, roll_number), branch = COALESCE($2, branch) WHERE id = $3',
        [roll_number, studentBranch, id]
    );

    await pool.query(
        'UPDATE users SET name = COALESCE($1, name) WHERE id = (SELECT user_id FROM students WHERE id = $2)',
        [name, id]
    );

    return { message: "Student updated successfully" };
};

export const deleteStudent = async (id) => {
    await pool.query(
        'DELETE FROM users WHERE id = (SELECT user_id FROM students WHERE id = $1)',
        [id]
    );
};
