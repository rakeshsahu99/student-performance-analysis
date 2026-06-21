import pool from "../config/db.js";

const GRADE_BANDS = [
    { label: "A+", min: 90 },
    { label: "A", min: 80 },
    { label: "B+", min: 70 },
    { label: "B", min: 60 },
    { label: "C+", min: 50 },
    { label: "C", min: 40 },
    { label: "D", min: 30 },
    { label: "F", min: 0 },
];

const getGradeBand = (percentage) => {
    const safePercentage = Number.isFinite(percentage) ? percentage : 0;
    return GRADE_BANDS.find((band) => safePercentage >= band.min)?.label || "F";
};

const buildGradeDistribution = (marksRows) =>
    GRADE_BANDS.map((band) => ({
        grade: band.label,
        count: marksRows.filter((mark) => {
            const markPercentage =
                (Number(mark.marks_obtained || 0) / Number(mark.max_marks || 20)) * 100;
            return getGradeBand(markPercentage) === band.label;
        }).length,
    }));

const buildZeroGradeDistribution = () =>
    GRADE_BANDS.map((band) => ({
        grade: band.label,
        count: 0,
    }));

export const getStudentAnalytics = async (user, student_id) => {
    if (!["admin", "student"].includes(user.role)) {
        throw new Error("Access denied");
    }

    if (user.role === "student") {
        const student = await pool.query(
            'SELECT id FROM students WHERE user_id = $1',
            [user.id]
        );

        if (student.rows.length === 0 || Number(student.rows[0].id) !== Number(student_id)) {
            throw new Error("Access denied");
        }
    }

    const marks = await pool.query(`
        SELECT
            m.marks_obtained,
            s.name AS subject,
            e.name AS exam,
            e.max_marks
        FROM marks m
        JOIN subjects s ON m.subject_id = s.id
        JOIN exams e ON m.exam_id = e.id
        WHERE m.student_id = $1
    `, [student_id]);

    if (marks.rows.length === 0) {
        throw new Error("No marks found");
    }

    const marksData = marks.rows;
    const total = marksData.reduce((sum, m) => sum + Number(m.marks_obtained || 0), 0);
    const maxTotal = marksData.reduce((sum, m) => sum + Number(m.max_marks || 20), 0);
    const percentage = (total / maxTotal) * 100;
    const grade = getGradeBand(percentage);

    const subjectPerformance = {};

    marksData.forEach((m) => {
        if (!subjectPerformance[m.subject]) {
            subjectPerformance[m.subject] = [];
        }

        subjectPerformance[m.subject].push({
            exam: m.exam,
            marks: Number(m.marks_obtained),
        });
    });

    const subjectTotals = {};
    const subjectCounts = {};

    marksData.forEach((m) => {
        if (!subjectTotals[m.subject]) {
            subjectTotals[m.subject] = 0;
            subjectCounts[m.subject] = 0;
        }

        subjectTotals[m.subject] += Number(m.marks_obtained || 0);
        subjectCounts[m.subject] += 1;
    });

    const subjectAverages = {};

    for (const subject in subjectTotals) {
        subjectAverages[subject] =
            subjectTotals[subject] / subjectCounts[subject];
    }

    let highestSubject = null;
    let lowestSubject = null;

    for (const subject in subjectAverages) {
        if (
            !highestSubject ||
            subjectAverages[subject] > subjectAverages[highestSubject]
        ) {
            highestSubject = subject;
        }

        if (
            !lowestSubject ||
            subjectAverages[subject] < subjectAverages[lowestSubject]
        ) {
            lowestSubject = subject;
        }
    }

    const gradeDistribution = buildGradeDistribution(marksData);

    const classData = await pool.query(`
         SELECT 
             AVG(m.marks_obtained * 100.0 / e.max_marks) as avg_percentage
         FROM marks m
         JOIN exams e ON m.exam_id = e.id
     `);

      const classAverage = Number(classData.rows[0].avg_percentage || 0);

      return {
          total_marks: total,
          percentage: Number(percentage).toFixed(2),
          grade,
          grade_distribution: gradeDistribution,
          subject_wise: subjectPerformance,
          highest_subject: highestSubject,
          lowest_subject: lowestSubject,
          class_average: Number(classAverage).toFixed(2),
      };
};

export const getTeacherAnalytics = async (teacherId) => {
    const assignments = await pool.query(`
        SELECT s.id, s.name
        FROM teacher_assignments ta
        JOIN subjects s ON ta.subject_id = s.id
        WHERE ta.teacher_id = $1
    `, [teacherId]);

    if (assignments.rows.length === 0) {
        return {
            subjects: [],
            totalStudents: 0,
            averagePercentage: 0,
            passRate: 0,
            passCount: 0,
            failCount: 0,
            grade_distribution: buildZeroGradeDistribution(),
        };
    }

    const studentsData = await pool.query(`
         SELECT 
             COUNT(DISTINCT m.student_id) as total_students,
             AVG(m.marks_obtained * 100.0 / e.max_marks) as avg_percentage,
             SUM(CASE WHEN (m.marks_obtained * 100.0 / e.max_marks) >= 30 THEN 1 ELSE 0 END) as pass_count,
             SUM(CASE WHEN (m.marks_obtained * 100.0 / e.max_marks) < 30 THEN 1 ELSE 0 END) as fail_count
         FROM marks m
         JOIN teacher_assignments ta ON ta.subject_id = m.subject_id
         JOIN exams e ON m.exam_id = e.id
         WHERE ta.teacher_id = $1
     `, [teacherId]);

     const subjectAverages = await pool.query(`
         SELECT 
             s.id,
             s.name,
             AVG(m.marks_obtained * 100.0 / e.max_marks) as average_percentage,
             MAX(m.marks_obtained * 100.0 / e.max_marks) as highest_percentage,
             MIN(m.marks_obtained * 100.0 / e.max_marks) as lowest_percentage
         FROM teacher_assignments ta
         JOIN subjects s ON ta.subject_id = s.id
         LEFT JOIN marks m ON s.id = m.subject_id
         LEFT JOIN exams e ON m.exam_id = e.id
         WHERE ta.teacher_id = $1
         GROUP BY s.id, s.name
         ORDER BY s.name
     `, [teacherId]);

    const data = studentsData.rows[0];
    const totalStudents = parseInt(data?.total_students || 0);
    const passCount = parseInt(data?.pass_count || 0);
    const failCount = parseInt(data?.fail_count || 0);
    const passRate = totalStudents > 0 ? ((passCount / totalStudents) * 100) : 0;
    const gradeDistributionData = await pool.query(`
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
             END AS grade,
             COUNT(*) AS count
         FROM marks m
         JOIN teacher_assignments ta ON ta.subject_id = m.subject_id
         JOIN exams e ON m.exam_id = e.id
         WHERE ta.teacher_id = $1
         GROUP BY grade
     `, [teacherId]);

    const gradeDistributionRows = gradeDistributionData.rows;

      return {
          subjects: subjectAverages.rows.map((s) => ({
              name: s.name,
              average: parseFloat(s.average_percentage || 0).toFixed(2),
              highest: parseFloat(s.highest_percentage || 0).toFixed(2),
              lowest: parseFloat(s.lowest_percentage || 0).toFixed(2),
          })),
          totalStudents,
          averagePercentage: parseFloat(data?.avg_percentage || 0).toFixed(2),
          passRate: Number(passRate).toFixed(2),
          passCount,
          failCount,
          grade_distribution: GRADE_BANDS.map((band) => ({
              grade: band.label,
              count: parseInt(gradeDistributionRows.find((row) => row.grade === band.label)?.count || 0),
          })),
      };
};

export const getSubjectStats = async (teacherId) => {
    const result = await pool.query(`
        SELECT 
            s.id as subject_id,
            s.name as subject_name,
            COUNT(DISTINCT m.student_id) as total_students,
            AVG(m.marks_obtained) as average_marks,
            MAX(m.marks_obtained) as highest_marks,
            MIN(m.marks_obtained) as lowest_marks
        FROM teacher_assignments ta
        JOIN subjects s ON ta.subject_id = s.id
        LEFT JOIN marks m ON s.id = m.subject_id
        WHERE ta.teacher_id = $1
        GROUP BY s.id, s.name
        ORDER BY s.name
    `, [teacherId]);

    return result.rows;
};

export const getSubjectDetails = async (teacherId, subjectId) => {
    const assignment = await pool.query(
        'SELECT id FROM teacher_assignments WHERE teacher_id = $1 AND subject_id = $2',
        [teacherId, subjectId]
    );

    if (assignment.rows.length === 0) {
        throw new Error("Access denied");
    }

     const stats = await pool.query(`
         SELECT 
             AVG(m.marks_obtained * 100.0 / e.max_marks) as class_average_percentage,
             SUM(CASE WHEN (m.marks_obtained * 1.0 / e.max_marks) >= (
                 SELECT AVG(m2.marks_obtained * 1.0 / e2.max_marks)
                 FROM marks m2
                 JOIN exams e2 ON m2.exam_id = e2.id
                 WHERE m2.subject_id = $1
             ) THEN 1 ELSE 0 END) as above_average,
             SUM(CASE WHEN (m.marks_obtained * 1.0 / e.max_marks) < (
                 SELECT AVG(m2.marks_obtained * 1.0 / e2.max_marks)
                 FROM marks m2
                 JOIN exams e2 ON m2.exam_id = e2.id
                 WHERE m2.subject_id = $1
             ) THEN 1 ELSE 0 END) as below_average,
             COUNT(*) as total_entries
         FROM marks m
         JOIN exams e ON m.exam_id = e.id
         WHERE m.subject_id = $1
     `, [subjectId]);

       return {
           class_average: parseFloat(stats.rows[0]?.class_average_percentage || 0).toFixed(2),
           above_average: parseInt(stats.rows[0]?.above_average || 0),
           below_average: parseInt(stats.rows[0]?.below_average || 0),
           total_entries: parseInt(stats.rows[0]?.total_entries || 0),
       };
};
