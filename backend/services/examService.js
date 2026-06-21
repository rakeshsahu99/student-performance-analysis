import pool from "../config/db.js";

export const getExams = async () => {
    const result = await pool.query('SELECT * FROM exams ORDER BY id DESC');
    return result.rows;
};
