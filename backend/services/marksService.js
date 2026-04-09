import sql from "../config/db.js";
import { AppError } from "../middleware/errorMiddleware.js";

export const addMarks = async (user, data) => {
    const { student_id, subject_id, exam_id, marks_obtained } = data;

    if (!student_id || !subject_id || !exam_id || marks_obtained === undefined) {
        throw new AppError("Missing required fields: student_id, subject_id, exam_id, marks_obtained", 400);
    }

    const exam = await sql`
    SELECT id FROM exams WHERE id = ${exam_id}
    `;
    if (exam.length === 0) {
        throw new AppError("Invalid exam_id", 400);
    }

    const student = await sql`
    SELECT id FROM students WHERE id = ${student_id}
    `;
    if (student.length === 0) {
        throw new AppError("Invalid student_id", 400);
    }

    const subject = await sql`
    SELECT id FROM subjects WHERE id = ${subject_id}
    `;
    if (subject.length === 0) {
        throw new AppError("Invalid subject_id", 400);
    }

    // 🔒 Check teacher assignment
    const assignment = await sql`
    SELECT * FROM teacher_assignments
    WHERE teacher_id = ${user.id}
    AND subject_id = ${subject_id}
    `;

    if (assignment.length === 0) {
        throw new AppError("Not allowed to add marks for this subject", 403);
    }

    if (marks_obtained < 0 || marks_obtained > 100) {
        throw new AppError("Marks must be between 0 and 100", 400);
    }

    try {
        const result = await sql`
      INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained)
      VALUES (${student_id}, ${subject_id}, ${exam_id}, ${marks_obtained})
      RETURNING *
    `;

        return result[0];
    } catch (err) {
        throw new AppError("Marks already entered for this exam", 409);
    }
};

export const updateMarks = async (user, id, data) => {
    const { marks_obtained } = data;

    if (marks_obtained === undefined) {
        throw new AppError("marks_obtained is required", 400);
    }

    if (marks_obtained < 0 || marks_obtained > 100) {
        throw new AppError("Marks must be between 0 and 100", 400);
    }

    // Get existing record
    const record = await sql`
    SELECT * FROM marks WHERE id = ${id}
  `;

    if (record.length === 0) {
        throw new AppError("Marks not found", 404);
    }

    const subject_id = record[0].subject_id;

    // 🔒 Check assignment
    const assignment = await sql`
    SELECT * FROM teacher_assignments
    WHERE teacher_id = ${user.id}
    AND subject_id = ${subject_id}
  `;

    if (assignment.length === 0) {
        throw new AppError("Not allowed to update these marks", 403);
    }

    const updated = await sql`
    UPDATE marks
    SET marks_obtained = ${marks_obtained}
    WHERE id = ${id}
    RETURNING *
  `;

    return updated[0];
};

export const getAllMarks = async () => {
    return await sql`
    SELECT 
      m.id,
      u.name AS student_name,
      s.name AS subject,
      e.name AS exam,
      m.marks_obtained
    FROM marks m
    JOIN students st ON m.student_id = st.id
    JOIN users u ON st.user_id = u.id
    JOIN subjects s ON m.subject_id = s.id
    JOIN exams e ON m.exam_id = e.id
    ORDER BY u.name
    `;
};

export const getMarksSummary = async () => {
    const totalStudents = await sql`SELECT COUNT(*) as count FROM students`;
    const totalMarks = await sql`SELECT COUNT(*) as count FROM marks`;
    const avgMarks = await sql`SELECT AVG(marks_obtained) as avg FROM marks`;
    
    const subjectStats = await sql`
    SELECT 
      s.name as subject,
      COUNT(m.id) as total_entries,
      AVG(m.marks_obtained) as average
    FROM subjects s
    LEFT JOIN marks m ON s.id = m.subject_id
    GROUP BY s.id, s.name
    ORDER BY s.name
    `;

    const topStudents = await sql`
    SELECT 
      u.name,
      AVG(m.marks_obtained) as avg_marks
    FROM marks m
    JOIN students st ON m.student_id = st.id
    JOIN users u ON st.user_id = u.id
    GROUP BY st.id, u.name
    ORDER BY avg_marks DESC
    LIMIT 5
    `;

    return {
        total_students: parseInt(totalStudents[0]?.count || 0),
        total_marks_entries: parseInt(totalMarks[0]?.count || 0),
        overall_average: parseFloat(avgMarks[0]?.avg || 0).toFixed(2),
        subject_stats: subjectStats,
        top_students: topStudents,
    };
};