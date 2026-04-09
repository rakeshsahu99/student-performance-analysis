import sql from "../config/db.js";

export const getStudentAnalytics = async (user, student_id) => {
    if (!["admin", "student"].includes(user.role)) {
        throw new Error("Access denied");
    }

    // Students can only access their own analytics.
    if (user.role === "student") {
        const student = await sql`
      SELECT id FROM students WHERE user_id = ${user.id}
    `;

        if (student.length === 0 || student[0].id !== student_id) {
            throw new Error("Access denied");
        }
    }

    const marks = await sql`
    SELECT
      m.marks_obtained,
      s.name AS subject,
      e.name AS exam
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    JOIN exams e ON m.exam_id = e.id
    WHERE m.student_id = ${student_id}
  `;

    if (marks.length === 0) {
        throw new Error("No marks found");
    }

    const total = marks.reduce((sum, m) => sum + m.marks_obtained, 0);
    const maxTotal = marks.length * 100;
    const percentage = (total / maxTotal) * 100;

    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 75) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    const subjectPerformance = {};

    marks.forEach((m) => {
        if (!subjectPerformance[m.subject]) {
            subjectPerformance[m.subject] = [];
        }

        subjectPerformance[m.subject].push({
            exam: m.exam,
            marks: m.marks_obtained,
        });
    });

    const subjectTotals = {};
    const subjectCounts = {};

    marks.forEach((m) => {
        if (!subjectTotals[m.subject]) {
            subjectTotals[m.subject] = 0;
            subjectCounts[m.subject] = 0;
        }

        subjectTotals[m.subject] += m.marks_obtained;
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

    const classData = await sql`
      SELECT AVG(marks_obtained) as avg_marks
      FROM marks
    `;

    const classAverage = Number(classData[0].avg_marks || 0).toFixed(2);

    return {
        total_marks: total,
        percentage: percentage.toFixed(2),
        grade,
        subject_wise: subjectPerformance,
        highest_subject: highestSubject,
        lowest_subject: lowestSubject,
        class_average: classAverage,
    };
};

export const getTeacherAnalytics = async (teacherId) => {
    const assignments = await sql`
    SELECT s.id, s.name
    FROM teacher_assignments ta
    JOIN subjects s ON ta.subject_id = s.id
    WHERE ta.teacher_id = ${teacherId}
    `;

    if (assignments.length === 0) {
        return {
            subjects: [],
            totalStudents: 0,
            averagePercentage: 0,
            passRate: 0,
            passCount: 0,
            failCount: 0,
        };
    }

    const studentsData = await sql`
    SELECT 
      COUNT(DISTINCT m.student_id) as total_students,
      AVG(m.marks_obtained) as avg_percentage,
      SUM(CASE WHEN m.marks_obtained >= 50 THEN 1 ELSE 0 END) as pass_count,
      SUM(CASE WHEN m.marks_obtained < 50 THEN 1 ELSE 0 END) as fail_count
    FROM marks m
    JOIN teacher_assignments ta ON ta.subject_id = m.subject_id
    WHERE ta.teacher_id = ${teacherId}
    `;

    const subjectAverages = await sql`
    SELECT 
      s.id,
      s.name,
      AVG(m.marks_obtained) as average
    FROM teacher_assignments ta
    JOIN subjects s ON ta.subject_id = s.id
    LEFT JOIN marks m ON s.id = m.subject_id
    WHERE ta.teacher_id = ${teacherId}
    GROUP BY s.id, s.name
    ORDER BY s.name
    `;

    const data = studentsData[0];
    const totalStudents = parseInt(data?.total_students || 0);
    const passCount = parseInt(data?.pass_count || 0);
    const failCount = parseInt(data?.fail_count || 0);
    const passRate = totalStudents > 0 ? ((passCount / totalStudents) * 100) : 0;

    return {
        subjects: subjectAverages.map((s) => ({
            name: s.name,
            average: parseFloat(s.average || 0).toFixed(2),
        })),
        totalStudents,
        averagePercentage: parseFloat(data?.avg_percentage || 0).toFixed(2),
        passRate: passRate.toFixed(2),
        passCount,
        failCount,
    };
};

export const getSubjectStats = async (teacherId) => {
    const assignments = await sql`
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
    WHERE ta.teacher_id = ${teacherId}
    GROUP BY s.id, s.name
    ORDER BY s.name
    `;

    return assignments;
};

export const getSubjectDetails = async (teacherId, subjectId) => {
    const assignment = await sql`
    SELECT id FROM teacher_assignments
    WHERE teacher_id = ${teacherId} AND subject_id = ${subjectId}
    `;

    if (assignment.length === 0) {
        throw new Error("Access denied");
    }

    const stats = await sql`
    SELECT 
      AVG(marks_obtained) as class_average,
      SUM(CASE WHEN marks_obtained >= (SELECT AVG(marks_obtained) FROM marks WHERE subject_id = ${subjectId}) THEN 1 ELSE 0 END) as above_average,
      SUM(CASE WHEN marks_obtained < (SELECT AVG(marks_obtained) FROM marks WHERE subject_id = ${subjectId}) THEN 1 ELSE 0 END) as below_average,
      COUNT(*) as total_entries
    FROM marks
    WHERE subject_id = ${subjectId}
    `;

    return {
        class_average: parseFloat(stats[0]?.class_average || 0).toFixed(2),
        above_average: parseInt(stats[0]?.above_average || 0),
        below_average: parseInt(stats[0]?.below_average || 0),
        total_entries: parseInt(stats[0]?.total_entries || 0),
    };
};
