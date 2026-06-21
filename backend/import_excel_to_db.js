import 'dotenv/config';
import pool from './config/db.js';
import * as XLSX from 'xlsx';
import { readFileSync } from 'fs';
import { hashPassword } from './utils/hash.js';

function parseExcelFile(buffer) {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data.map(row => ({
        roll_number: String(row.roll_number || row.Roll_Number || row['Roll Number'] || ''),
        name: String(row.name || row.Name || row.Student_Name || row['Student Name'] || ''),
        branch: String(row.branch || row.Branch || row.Section || ''),
        subject: String(row.subject || row.Subject || ''),
        exam: String(row.exam || row.Exam || ''),
        marks_obtained: parseFloat(row.marks_obtained || row.Marks_Obtained || row['Marks Obtained'] || row.marks || row.Marks || 0),
    }));
}

async function importStudentsFromExcel(studentData) {
    const results = { success: 0, errors: [] };

    for (const student of studentData) {
        try {
            // Check if student already exists
            const existingStudent = await pool.query(
                'SELECT s.id FROM students s JOIN users u ON s.user_id = u.id WHERE s.roll_number = $1',
                [student.roll_number]
            );

            if (existingStudent.rows.length > 0) {
                results.errors.push(`Student with roll number ${student.roll_number} already exists`);
                continue;
            }

            // Create user account
            const hashedPassword = await hashPassword('password123'); // Default password
            const userResult = await pool.query(
                'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
                [student.name, `${student.roll_number}@student.local`, hashedPassword, 'student']
            );

            // Create student record
            await pool.query(
                'INSERT INTO students (user_id, roll_number, branch) VALUES ($1, $2, $3)',
                [userResult.rows[0].id, student.roll_number, student.branch]
            );

            results.success++;
        } catch (error) {
            results.errors.push(`Error importing student ${student.roll_number}: ${error.message}`);
        }
    }

    return results;
}

async function importMarksFromExcel(marksData) {
    const results = { success: 0, errors: [] };

    for (const mark of marksData) {
        try {
            // Find student
            const student = await pool.query(
                'SELECT s.id FROM students s WHERE s.roll_number = $1',
                [mark.roll_number]
            );

            if (student.rows.length === 0) {
                results.errors.push(`Student with roll number ${mark.roll_number} not found`);
                continue;
            }

            // Find subject
            const subject = await pool.query(
                'SELECT id FROM subjects WHERE LOWER(name) = LOWER($1)',
                [mark.subject]
            );

            if (subject.rows.length === 0) {
                results.errors.push(`Subject ${mark.subject} not found`);
                continue;
            }

            // Find exam
            const exam = await pool.query(
                'SELECT id, max_marks FROM exams WHERE LOWER(name) = LOWER($1)',
                [mark.exam]
            );

            if (exam.rows.length === 0) {
                results.errors.push(`Exam ${mark.exam} not found`);
                continue;
            }

            // Validate marks
            const maxMarks = exam.rows[0].max_marks;
            const obtainedMarks = Math.min(mark.marks_obtained, maxMarks);

            // Insert marks
            await pool.query(
                'INSERT INTO marks (student_id, subject_id, exam_id, marks_obtained) VALUES ($1, $2, $3, $4) ON CONFLICT (student_id, subject_id, exam_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained',
                [student.rows[0].id, subject.rows[0].id, exam.rows[0].id, obtainedMarks]
            );

            results.success++;
        } catch (error) {
            results.errors.push(`Error importing marks for ${mark.roll_number}: ${error.message}`);
        }
    }

    return results;
}

async function run() {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.log('Usage: node import_excel_to_db.js <file_path> <type>');
        console.log('Types: students, marks');
        process.exit(1);
    }

    const [filePath, type] = args;

    try {
        console.log(`Reading Excel file: ${filePath}`);
        const buffer = readFileSync(filePath);
        const data = parseExcelFile(buffer);

        console.log(`Parsed ${data.length} rows from Excel file`);

        let results;
        if (type === 'students') {
            console.log('Importing students...');
            results = await importStudentsFromExcel(data);
        } else if (type === 'marks') {
            console.log('Importing marks...');
            results = await importMarksFromExcel(data);
        } else {
            console.error('Invalid type. Use "students" or "marks"');
            process.exit(1);
        }

        console.log(`Import completed:`);
        console.log(`- Success: ${results.success}`);
        console.log(`- Errors: ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('Errors:');
            results.errors.forEach(error => console.log(`  - ${error}`));
        }

    } catch (error) {
        console.error('Import failed:', error.message);
        process.exitCode = 1;
    }
}

run();
