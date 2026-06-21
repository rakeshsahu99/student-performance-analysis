import pool from "../config/db.js";

const normalizeSubjectName = (value) => String(value || "").trim();
const normalizeSubjectCode = (value) => String(value || "").trim().toUpperCase();

const ensureSubjectCodeColumn = async (client) => {
    await client.query('ALTER TABLE subjects ADD COLUMN IF NOT EXISTS code TEXT');
};

const getOrCreateSubject = async (client, subjectName, subjectCode) => {
    await ensureSubjectCodeColumn(client);

    const lookupParams = [];
    const lookupClauses = [];

    if (subjectCode) {
        lookupParams.push(subjectCode);
        lookupClauses.push(`UPPER(code) = $${lookupParams.length}`);
    }

    if (subjectName) {
        lookupParams.push(subjectName);
        lookupClauses.push(`LOWER(name) = LOWER($${lookupParams.length})`);
    }

    const existing = lookupClauses.length > 0
        ? await client.query(
            `SELECT id, name, code FROM subjects WHERE ${lookupClauses.join(" OR ")} LIMIT 1`,
            lookupParams
        )
        : { rows: [] };

    if (existing.rows.length > 0) {
        return existing.rows[0];
    }

    const inserted = await client.query(
        "INSERT INTO subjects (name, code) VALUES ($1, $2) RETURNING id, name, code",
        [subjectName, subjectCode || null]
    );

    return inserted.rows[0];
};

export const assignTeacher = async ({ teacher_id, subject_id, subject_name, subject_code }) => {
  const subjectName = normalizeSubjectName(subject_name);
  const subjectCode = normalizeSubjectCode(subject_code);

    if (!teacher_id) {
        throw new Error("Invalid teacher");
    }

    if (!subject_id && !subjectName && !subjectCode) {
        throw new Error("Subject name or code is required");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const teacher = await client.query(
            "SELECT * FROM users WHERE id = $1 AND role = $2",
            [teacher_id, "teacher"]
        );

        if (teacher.rows.length === 0) {
            throw new Error("Invalid teacher");
        }

        const subject = subject_id
            ? await client.query("SELECT id, name, code FROM subjects WHERE id = $1", [subject_id])
            : await getOrCreateSubject(client, subjectName, subjectCode);

        const subjectRow = subject_id ? subject.rows[0] : subject;

        if (!subjectRow) {
            throw new Error("Invalid subject");
        }

        const result = await client.query(
            "INSERT INTO teacher_assignments (teacher_id, subject_id) VALUES ($1, $2) RETURNING *",
            [teacher_id, subjectRow.id]
        );

        await client.query("COMMIT");
        return result.rows[0];
    } catch (err) {
        await client.query("ROLLBACK");

        if (err && err.code === "23505") {
            throw new Error("Assignment already exists");
        }

        throw new Error(err.message || "Failed to assign subject");
    } finally {
        client.release();
    }
};

export const getAssignments = async () => {
    const result = await pool.query(`
        SELECT 
            ta.id,
            ta.teacher_id,
            ta.subject_id,
            u.name AS teacher_name,
            u.email,
            s.name AS subject_name,
            s.code AS subject_code
        FROM teacher_assignments ta
        JOIN users u ON ta.teacher_id = u.id
        JOIN subjects s ON ta.subject_id = s.id
        ORDER BY u.name
    `);
    return result.rows;
};

export const getTeacherAssignments = async (teacherId) => {
    const result = await pool.query(`
        SELECT 
            ta.id,
            ta.teacher_id,
            ta.subject_id,
            s.name AS subject_name,
            s.code AS subject_code
        FROM teacher_assignments ta
        JOIN subjects s ON ta.subject_id = s.id
        WHERE ta.teacher_id = $1
        ORDER BY s.name
    `, [teacherId]);
    return result.rows;
};
