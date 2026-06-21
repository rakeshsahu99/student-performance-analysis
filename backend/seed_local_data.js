import 'dotenv/config';
import pool from './config/db.js';
import { hashPassword } from './utils/hash.js';

const DEFAULT_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Machine Learning'];
const MIDSEM_EXAM = { name: 'Midsem', maxMarks: 20 };

// Sample students for testing (69 students)
const SAMPLE_STUDENTS = Array.from({ length: 69 }, (_, i) => ({
    roll_number: `CS2023${String(i + 1).padStart(3, '0')}`,
    name: `Student ${i + 1}`,
    branch: i < 35 ? 'CS-A' : 'CS-B',  // first 35 in CS-A, rest in CS-B
}));

async function run() {
  try {
    const adminName = process.env.SEED_ADMIN_NAME || 'Local Admin';
    const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@local.test';
    const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

    const teacherName = process.env.SEED_TEACHER_NAME || 'Minakshi Pant';
    const teacherEmail = process.env.SEED_TEACHER_EMAIL || 'minakshipant@outr.ac.in';
    const teacherPassword = process.env.SEED_TEACHER_PASSWORD || 'minakshi@123';

    await pool.query(`
       ALTER TABLE exams
       ADD COLUMN IF NOT EXISTS max_marks NUMERIC(5, 2) NOT NULL DEFAULT 20
       CHECK (max_marks > 0)
     `);

    for (const subject of DEFAULT_SUBJECTS) {
      await pool.query(
        'INSERT INTO subjects (name) VALUES ($1) ON CONFLICT (name) DO NOTHING',
        [subject]
      );
    }

    const existingMidsem = await pool.query(
      'SELECT id FROM exams WHERE LOWER(name) = LOWER($1)',
      [MIDSEM_EXAM.name]
    );

    let midsemExamId;
    if (existingMidsem.rows.length === 0) {
      const insertedMidsem = await pool.query(
        'INSERT INTO exams (name, max_marks) VALUES ($1, $2) RETURNING id',
        [MIDSEM_EXAM.name, MIDSEM_EXAM.maxMarks]
      );
      midsemExamId = insertedMidsem.rows[0].id;
    } else {
      midsemExamId = existingMidsem.rows[0].id;
      await pool.query(
        'UPDATE exams SET name = $1, max_marks = $2 WHERE id = $3',
        [MIDSEM_EXAM.name, MIDSEM_EXAM.maxMarks, midsemExamId]
      );
    }

    // Move legacy exam rows and marks into the canonical Midsem exam.
    const legacyExams = await pool.query(
      'SELECT id FROM exams WHERE id <> $1',
      [midsemExamId]
    );

    if (legacyExams.rows.length > 0) {
      await pool.query(
        `
        WITH ranked_marks AS (
          SELECT
            student_id,
            subject_id,
            LEAST(marks_obtained, $2) AS normalized_marks,
            ROW_NUMBER() OVER (
              PARTITION BY student_id, subject_id
              ORDER BY created_at DESC, id DESC
            ) AS row_num
          FROM marks
        ),
        upserted_marks AS (
          INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained)
          SELECT student_id, subject_id, $1, normalized_marks
          FROM ranked_marks
          WHERE row_num = 1
          ON CONFLICT (student_id, subject_id, exam_id)
          DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained
        )
        SELECT 1
        `,
        [midsemExamId, MIDSEM_EXAM.maxMarks]
      );

      await pool.query(
        'DELETE FROM marks WHERE exam_id <> $1',
        [midsemExamId]
      );

      await pool.query(
        'DELETE FROM exams WHERE id <> $1',
        [midsemExamId]
      );
    } else {
      await pool.query(
        'UPDATE marks SET exam_id = $1, marks_obtained = LEAST(marks_obtained, $2)',
        [midsemExamId, MIDSEM_EXAM.maxMarks]
      );
    }

    // Remove any legacy teacher email that should not exist
    await pool.query(
      'DELETE FROM users WHERE email = $1 AND role = $2',
      ['minakshi.pant@teacher.local', 'teacher']
    );

    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await hashPassword(adminPassword);
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'admin')`,
        [adminName, adminEmail, hashedPassword]
      );
    }

    // Seed teacher account
    const existingTeacher = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [teacherEmail]
    );

    if (existingTeacher.rows.length === 0) {
      const hashedTeacherPassword = await hashPassword(teacherPassword);
      await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, 'teacher')`,
        [teacherName, teacherEmail, hashedTeacherPassword]
      );
    }

    // Get teacher user ID
    const teacherResult = await pool.query(
      'SELECT id FROM users WHERE email = $1 AND role = $2',
      [teacherEmail, 'teacher']
    );

    if (teacherResult.rows.length === 0) {
      throw new Error('Teacher not found');
    }
    const teacherId = teacherResult.rows[0].id;

    // Auto-assign all default subjects to the teacher
    for (const subject of DEFAULT_SUBJECTS) {
      await pool.query(
        `INSERT INTO teacher_assignments (teacher_id, subject_id)
             SELECT $1, s.id FROM subjects s WHERE s.name = $2
             ON CONFLICT (teacher_id, subject_id) DO NOTHING`,
        [teacherId, subject]
      );
    }

    // Seed sample students for testing
    for (const student of SAMPLE_STUDENTS) {
      try {
        // Check if student already exists by roll_number
        const existingStudent = await pool.query(
          'SELECT id FROM students WHERE roll_number = $1',
          [student.roll_number]
        );

        if (existingStudent.rows.length === 0) {
          const hashedPassword = await hashPassword('password123');
          // Create user with anonymized email
          const userResult = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
            [student.name, `${student.roll_number}@students.local`, hashedPassword, 'student']
          );

          const userId = userResult.rows[0].id;

           // Create student record
           await pool.query(
               'INSERT INTO students (user_id, roll_number, branch) VALUES ($1, $2, $3)',
               [userId, student.roll_number, student.branch]
           );
        }
      } catch (error) {
        // Skip if student already exists or error occurs
        console.log(`Student ${student.roll_number} skipped: ${error.message}`);
      }
    }

    // Generate sample marks for all students across all subjects
    // Get the midsem exam ID (already created earlier)
    const examResult = await pool.query(
      'SELECT id FROM exams WHERE LOWER(name) = LOWER($1)',
      [MIDSEM_EXAM.name]
    );

    if (examResult.rows.length > 0) {
      const examId = examResult.rows[0].id;

      for (const subject of DEFAULT_SUBJECTS) {
        // Get subject ID
        const subjectResult = await pool.query(
          'SELECT id FROM subjects WHERE name = $1',
          [subject]
        );

        if (subjectResult.rows.length === 0) continue;
        const subjectId = subjectResult.rows[0].id;

        // Generate marks for each sample student
        for (const student of SAMPLE_STUDENTS) {
          try {
            // Get student ID by roll number
            const studentResult = await pool.query(
              'SELECT s.id FROM students s WHERE s.roll_number = $1',
              [student.roll_number]
            );

            if (studentResult.rows.length === 0) continue;
            const studentId = studentResult.rows[0].id;

            // Generate pseudo-random mark based on subject and student roll number
            // to ensure consistency across runs
            const rollNum = parseInt(student.roll_number.slice(-2) || '01');
            const subjectCode = subject.charCodeAt(0);
            const randomOffset = (rollNum + subjectCode) % 11; // 0-10

            // Base marks range: 8-20 (with some failing marks for variety)
            const marks = Math.max(5, Math.min(20, 8 + randomOffset));

            // Upsert mark for this student-subject-exam combination
            await pool.query(
              `INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained)
                         VALUES ($1, $2, $3, $4)
                         ON CONFLICT (student_id, subject_id, exam_id)
                         DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained`,
              [studentId, subjectId, examId, marks]
            );
          } catch (error) {
            console.log(`Mark generation failed for ${student.roll_number} in ${subject}: ${error.message}`);
          }
        }
      }
    }

    // Anonymize student emails: replace personal emails with roll_number@students.local
    // This ensures student email privacy across the system
    await pool.query(`
        UPDATE users u
        SET email = CONCAT(s.roll_number, '@students.local')
        FROM students s
        WHERE u.id = s.user_id
          AND u.role = 'student'
          AND u.email NOT LIKE CONCAT(s.roll_number, '@students.local')
    `);

    console.log('Local seed complete.');
    console.log(`Admin email: ${adminEmail}`);
    console.log(`Admin password: ${adminPassword}`);
    console.log(`Teacher email: ${teacherEmail}`);
    console.log(`Teacher password: ${teacherPassword}`);
    console.log(`Subjects seeded: ${DEFAULT_SUBJECTS.join(', ')}`);
    console.log(`Teacher assignments: All ${DEFAULT_SUBJECTS.length} subjects assigned`);
    console.log(`Sample students created: ${SAMPLE_STUDENTS.length}`);
    console.log(`Marks entries generated: ${DEFAULT_SUBJECTS.length * SAMPLE_STUDENTS.length} (${SAMPLE_STUDENTS.length} students × ${DEFAULT_SUBJECTS.length} subjects)`);
    console.log(`Exam normalized: ${MIDSEM_EXAM.name} (${MIDSEM_EXAM.maxMarks} marks)`);
  } catch (error) {
    console.error('Seed failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

run();
