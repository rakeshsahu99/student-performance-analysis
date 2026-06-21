import pool from "../config/db.js";

export const getSubjects = async () => {
    const result = await pool.query('SELECT * FROM subjects ORDER BY name');
    return result.rows;
};