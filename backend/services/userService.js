import pool from "../config/db.js";
import { hashPassword } from "../utils/hash.js";

export const createTeacher = async ({ name, email, password }) => {
  // Check if email exists
  const existing = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (existing.rows.length > 0) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(password);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, 'teacher']
  );

  return result.rows[0];
};

export const getAllTeachers = async () => {
  const teachers = await pool.query(
    "SELECT id, name, email, role FROM users WHERE role = 'teacher' ORDER BY id DESC"
  );

  return teachers.rows;
};

export const deleteTeacher = async (id) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const teacher = await client.query(
      "SELECT id FROM users WHERE id = $1 AND role = $2",
      [id, "teacher"]
    );

    if (teacher.rows.length === 0) {
      throw new Error("Teacher not found");
    }

    await client.query(
      "DELETE FROM teacher_assignments WHERE teacher_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM users WHERE id = $1 AND role = $2",
      [id, "teacher"]
    );

    await client.query("COMMIT");

    return { message: "Teacher deleted successfully" };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
