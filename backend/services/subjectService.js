import sql from "../config/db.js";

export const getSubjects = async () => {
    return await sql`
    SELECT * FROM subjects ORDER BY name
    `;
};