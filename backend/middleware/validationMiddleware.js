import { AppError } from "./errorMiddleware.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

const toNumber = (value) => Number(value);

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!isNonEmptyString(name)) {
    return next(new AppError("Name is required", 400));
  }
  if (!isValidEmail(email)) {
    return next(new AppError("Valid email is required", 400));
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  return next();
};

export const validateLogin = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!role || !["admin", "teacher", "student"].includes(role.toLowerCase())) {
    return next(new AppError("Role is required (admin, teacher, or student)", 400));
  }

  const normalizedRole = role.toLowerCase();

  if (normalizedRole === "student") {
    if (!isNonEmptyString(req.body.rollNumber)) {
      return next(new AppError("Registration number is required", 400));
    }
  } else {
    if (!isValidEmail(email)) {
      return next(new AppError("Valid email is required", 400));
    }
  }

  if (!isNonEmptyString(password)) {
    return next(new AppError("Password is required", 400));
  }

  return next();
};

export const validatePasswordResetRequest = (req, res, next) => {
  const { email } = req.body;
  if (!isValidEmail(email)) {
    return next(new AppError("Valid email is required", 400));
  }
  return next();
};

export const validatePasswordReset = (req, res, next) => {
  const { token, password } = req.body;

  if (!isNonEmptyString(token)) {
    return next(new AppError("Reset token is required", 400));
  }
  if (!isNonEmptyString(password) || password.length < 6) {
    return next(new AppError("Password must be at least 6 characters", 400));
  }

  return next();
};

export const validateMarksCreate = (req, res, next) => {
  const { student_id, subject_id, exam_id, marks_obtained } = req.body;

  const studentIdNum = toNumber(student_id);
  const subjectIdNum = toNumber(subject_id);
  const examIdNum = toNumber(exam_id);
  const marksNum = toNumber(marks_obtained);

  if (!Number.isInteger(studentIdNum) || studentIdNum <= 0) {
    return next(new AppError("student_id must be a positive integer", 400));
  }
  if (!Number.isInteger(subjectIdNum) || subjectIdNum <= 0) {
    return next(new AppError("subject_id must be a positive integer", 400));
  }
  if (!Number.isInteger(examIdNum) || examIdNum <= 0) {
    return next(new AppError("exam_id must be a positive integer", 400));
  }
  if (!Number.isFinite(marksNum) || marksNum < 0 || marksNum > 100) {
    return next(new AppError("marks_obtained must be between 0 and 100", 400));
  }

  req.body.student_id = studentIdNum;
  req.body.subject_id = subjectIdNum;
  req.body.exam_id = examIdNum;
  req.body.marks_obtained = marksNum;

  return next();
};

export const validateMarksUpdate = (req, res, next) => {
  const idNum = toNumber(req.params.id);
  const marksNum = toNumber(req.body.marks_obtained);

  if (!Number.isInteger(idNum) || idNum <= 0) {
    return next(new AppError("id must be a positive integer", 400));
  }
  if (!Number.isFinite(marksNum) || marksNum < 0 || marksNum > 100) {
    return next(new AppError("marks_obtained must be between 0 and 100", 400));
  }

  req.params.id = String(idNum);
  req.body.marks_obtained = marksNum;

  return next();
};
