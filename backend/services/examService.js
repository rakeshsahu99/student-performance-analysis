import sql from "../config/db.js";

export const getExams = async () => {
    return await sql`
    SELECT * FROM exams ORDER BY id DESC
    `;
};
