import pool from "../config/db.js";
import { AppError } from "../middleware/errorMiddleware.js";

export const addMarks = async (user, data) => {
    const { student_id, subject_id, exam_id, marks_obtained } = data;

    if (!student_id || !subject_id || !exam_id || marks_obtained === undefined) {
        throw new AppError("Missing required fields: student_id, subject_id, exam_id, marks_obtained", 400);
    }

    const exam = await pool.query('SELECT id FROM exams WHERE id = $1', [exam_id]);
    if (exam.rows.length === 0) {
        throw new AppError("Invalid exam_id", 400);
    }

    const student = await pool.query('SELECT id FROM students WHERE id = $1', [student_id]);
    if (student.rows.length === 0) {
        throw new AppError("Invalid student_id", 400);
    }

    const subject = await pool.query('SELECT id FROM subjects WHERE id = $1', [subject_id]);
    if (subject.rows.length === 0) {
        throw new AppError("Invalid subject_id", 400);
    }

    const assignment = await pool.query(
        'SELECT * FROM teacher_assignments WHERE teacher_id = $1 AND subject_id = $2',
        [user.id, subject_id]
    );

    if (assignment.rows.length === 0) {
        throw new AppError("Not allowed to add marks for this subject", 403);
    }

    if (marks_obtained < 0 || marks_obtained > 20) {
        throw new AppError("Marks must be between 0 and 20", 400);
    }

    try {
        const result = await pool.query(
            'INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained) VALUES ($1, $2, $3, $4) RETURNING *',
            [student_id, subject_id, exam_id, marks_obtained]
        );

        return result.rows[0];
    } catch (err) {
        throw new AppError("Marks already entered for this exam", 409);
    }
};

export const updateMarks = async (user, id, data) => {
    const { marks_obtained } = data;

    if (marks_obtained === undefined) {
        throw new AppError("marks_obtained is required", 400);
    }

    if (marks_obtained < 0 || marks_obtained > 20) {
        throw new AppError("Marks must be between 0 and 20", 400);
    }

    const record = await pool.query('SELECT * FROM marks WHERE id = $1', [id]);

    if (record.rows.length === 0) {
        throw new AppError("Marks not found", 404);
    }

    const subject_id = record.rows[0].subject_id;

    const assignment = await pool.query(
        'SELECT * FROM teacher_assignments WHERE teacher_id = $1 AND subject_id = $2',
        [user.id, subject_id]
    );

    if (assignment.rows.length === 0) {
        throw new AppError("Not allowed to update these marks", 403);
    }

    const updated = await pool.query(
        'UPDATE marks SET marks_obtained = $1 WHERE id = $2 RETURNING *',
        [marks_obtained, id]
    );

    return updated.rows[0];
};

export const getAllMarks = async () => {
    const result = await pool.query(`
        SELECT 
            m.id,
            u.name AS student_name,
            st.branch AS branch,
            st.roll_number AS roll_number,
            COALESCE(st.regd_no, st.roll_number) AS regd_no,
            s.name AS subject,
            e.name AS exam,
            m.marks_obtained
        FROM marks m
        JOIN students st ON m.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN subjects s ON m.subject_id = s.id
        JOIN exams e ON m.exam_id = e.id
        ORDER BY u.name
    `);
    return result.rows;
};

export const getTeacherMarks = async (teacherId, branch = null) => {
    let query = `
        SELECT 
            m.id,
            m.student_id,
            m.subject_id,
            m.exam_id,
            u.name AS student_name,
            st.branch AS branch,
            st.roll_number AS roll_number,
            COALESCE(st.regd_no, st.roll_number) AS regd_no,
            s.name AS subject,
            e.name AS exam,
            m.marks_obtained
        FROM marks m
        JOIN students st ON m.student_id = st.id
        JOIN users u ON st.user_id = u.id
        JOIN subjects s ON m.subject_id = s.id
        JOIN exams e ON m.exam_id = e.id
        JOIN teacher_assignments ta ON ta.subject_id = m.subject_id
        WHERE ta.teacher_id = $1
    `;
    const params = [teacherId];

    if (branch) {
        query += ` AND st.branch = $2`;
        params.push(branch);
    }

    query += ` ORDER BY u.name, s.name, e.name`;

    const result = await pool.query(query, params);
    return result.rows;
};

 export const getMarksSummary = async () => {
     const totalStudents = await pool.query('SELECT COUNT(*) as count FROM students');
     const totalMarks = await pool.query('SELECT COUNT(*) as count FROM marks');
     const gradeOrder = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
     
     const subjectStats = await pool.query(`
         SELECT 
             s.name as subject,
             COUNT(m.id) as total_entries,
             AVG(m.marks_obtained * 100.0 / e.max_marks) as average_percentage
         FROM subjects s
         LEFT JOIN marks m ON s.id = m.subject_id
         LEFT JOIN exams e ON m.exam_id = e.id
         GROUP BY s.id, s.name
         ORDER BY s.name
     `);

     const topStudents = await pool.query(`
         SELECT 
             u.name,
             AVG(m.marks_obtained * 100.0 / e.max_marks) as avg_percentage
         FROM marks m
         JOIN students st ON m.student_id = st.id
         JOIN users u ON st.user_id = u.id
         JOIN exams e ON m.exam_id = e.id
         GROUP BY st.id, u.name
         ORDER BY avg_percentage DESC
         LIMIT 5
     `);

     const avgPercentageResult = await pool.query(`
         SELECT AVG(m.marks_obtained * 100.0 / e.max_marks) as overall_percentage
         FROM marks m
         JOIN exams e ON m.exam_id = e.id
     `);

     const gradeDistributionResult = await pool.query(`
         SELECT 
             CASE
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 90 THEN 'A+'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 80 THEN 'A'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 70 THEN 'B+'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 60 THEN 'B'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 50 THEN 'C+'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 40 THEN 'C'
                 WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 30 THEN 'D'
                 ELSE 'F'
             END as grade,
             COUNT(*) as count
         FROM marks m
         JOIN exams e ON m.exam_id = e.id
         GROUP BY grade
     `);

      return {
          total_students: parseInt(totalStudents.rows[0]?.count || 0),
          total_marks_entries: parseInt(totalMarks.rows[0]?.count || 0),
          overall_average: parseFloat(avgPercentageResult.rows[0]?.overall_percentage || 0).toFixed(2),
          grade_distribution: gradeOrder.map((grade) => ({
              grade,
              count: parseInt(gradeDistributionResult.rows.find((row) => row.grade === grade)?.count || 0),
          })),
          subject_stats: subjectStats.rows.map(row => ({
              subject: row.subject,
              total_entries: row.total_entries,
              average: parseFloat(row.average_percentage || 0).toFixed(2),
          })),
          top_students: topStudents.rows.map(row => ({
              name: row.name,
              avg_marks: parseFloat(row.avg_percentage || 0).toFixed(2),
          })),
      };
 };
