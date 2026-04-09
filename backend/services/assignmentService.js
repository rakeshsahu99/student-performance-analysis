import sql from "../config/db.js";

export const assignTeacher = async ({ teacher_id, subject_id }) => {
    // Check if teacher exists and is actually a teacher
    const teacher = await sql`
    SELECT * FROM users 
    WHERE id = ${teacher_id} AND role = 'teacher'
  `;

    if (teacher.length === 0) {
        throw new Error("Invalid teacher");
    }

    // Check if subject exists
    const subject = await sql`
    SELECT * FROM subjects WHERE id = ${subject_id}
  `;

    if (subject.length === 0) {
        throw new Error("Invalid subject");
    }

    try {
        const result = await sql`
      INSERT INTO teacher_assignments (teacher_id, subject_id)
      VALUES (${teacher_id}, ${subject_id})
      RETURNING *
    `;

        return result[0];
    } catch (err) {
        // Unique constraint handles duplicates
        throw new Error("Assignment already exists");
    }
};

export const getAssignments = async () => {
    return await sql`
    SELECT 
      ta.id,
      ta.teacher_id,
      ta.subject_id,
      u.name AS teacher_name,
      u.email,
      s.name AS subject_name
    FROM teacher_assignments ta
    JOIN users u ON ta.teacher_id = u.id
    JOIN subjects s ON ta.subject_id = s.id
    ORDER BY u.name
    `;
};

export const getTeacherAssignments = async (teacherId) => {
    return await sql`
    SELECT 
      ta.id,
      ta.teacher_id,
      ta.subject_id,
      s.name AS subject_name
    FROM teacher_assignments ta
    JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.teacher_id = ${teacherId}
    ORDER BY s.name
    `;
};