import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import {
  ClipboardListIcon,
  Notice,
  PencilSquareIcon,
  SectionCard,
  StatCard,
  TeacherPageShell,
  UsersIcon,
} from "../../components/teacher/TeacherUi";

interface Student {
  id: number;
  name: string;
  roll_number: string;
}

interface Subject {
  subject_id: number;
  subject_name: string;
}

interface Exam {
  id: number;
  name: string;
}

const MarksEntry = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    student_id: "",
    subject_id: "",
    exam_id: "",
    marks_obtained: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, subjectsRes, examsRes] = await Promise.all([
        api.get("/students"),
        api.get("/assignments/my"),
        api.get("/exams"),
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
      setExams(examsRes.data);
      setError("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to fetch data");
      } else {
        setError("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const completionText = useMemo(() => {
    const values = Object.values(formData);
    const completed = values.filter(Boolean).length;
    return `${completed}/4 fields ready`;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/marks", {
        student_id: formData.student_id,
        subject_id: formData.subject_id,
        exam_id: formData.exam_id,
        marks_obtained: parseInt(formData.marks_obtained),
      });
      setSuccess("Marks submitted successfully.");
      setFormData({
        student_id: "",
        subject_id: "",
        exam_id: "",
        marks_obtained: "",
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to submit marks");
      } else {
        setError("Failed to submit marks");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClassName =
    "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950/80 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-sky-500 dark:focus:ring-sky-500/15";

  if (loading) {
    return (
      <TeacherPageShell
        eyebrow="Assessment workflow"
        title="Prepare marks entry with a cleaner scoring interface."
        description="Loading students, subjects, and exams for your assessment workspace."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="h-[440px] animate-pulse rounded-[26px] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70" />
          <div className="h-[440px] animate-pulse rounded-[26px] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70" />
        </div>
      </TeacherPageShell>
    );
  }

  return (
    <TeacherPageShell
      eyebrow="Assessment workflow"
      title="Enter marks with a more professional, guided layout."
      description="The scoring page now separates form entry from context, helping teachers move faster while keeping exam submissions readable and reliable."
    >
      {error ? (
        <Notice title="Something needs attention" message={error} />
      ) : null}
      {success ? (
        <Notice title="Submission complete" message={success} tone="success" />
      ) : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          label="Students"
          value={String(students.length)}
          hint="Available for selection"
          icon={UsersIcon}
          tone="blue"
        />
        <StatCard
          label="Subjects"
          value={String(subjects.length)}
          hint="Assigned to your account"
          icon={ClipboardListIcon}
          tone="emerald"
        />
        <StatCard
          label="Form Readiness"
          value={completionText}
          hint="Complete all fields before submission"
          icon={PencilSquareIcon}
          tone="amber"
        />
      </div>

      {subjects.length === 0 ? (
        <SectionCard
          title="Subject assignment required"
          description="Marks can be entered once subjects have been assigned to your teacher profile."
        >
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-950/50">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950">
              <ClipboardListIcon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold text-slate-950 dark:text-white">
              No assigned subjects yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Contact your administrator to assign at least one subject before
              using this assessment workflow.
            </p>
          </div>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <SectionCard
            title="Marks submission"
            description="Fill in the student, subject, exam, and score. The new layout keeps the form compact and easier to scan."
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Select student
                  </label>
                  <select
                    className={inputClassName}
                    value={formData.student_id}
                    onChange={(e) =>
                      setFormData({ ...formData, student_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose a student</option>
                    {students.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.roll_number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Select subject
                  </label>
                  <select
                    className={inputClassName}
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map((subject) => (
                      <option
                        key={subject.subject_id}
                        value={subject.subject_id}
                      >
                        {subject.subject_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Select exam
                  </label>
                  <select
                    className={inputClassName}
                    value={formData.exam_id}
                    onChange={(e) =>
                      setFormData({ ...formData, exam_id: e.target.value })
                    }
                    required
                  >
                    <option value="">Choose an exam</option>
                    {exams.map((exam) => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Marks obtained
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className={inputClassName}
                    placeholder="Enter a score from 0 to 100"
                    value={formData.marks_obtained}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        marks_obtained: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Double-check the exam and student selection before submitting.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                  {submitting ? "Submitting..." : "Submit marks"}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Entry guidance"
            description="Helpful context alongside the form keeps the workflow more professional and easier to follow."
          >
            <div className="space-y-4">
              <div className="rounded-[22px] bg-gradient-to-br from-sky-600 to-slate-950 p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
                  Submission status
                </p>
                <p className="mt-3 text-3xl font-semibold">{completionText}</p>
                <p className="mt-2 text-sm text-slate-200">
                  Complete all inputs, then submit once for a clean record
                  entry.
                </p>
              </div>
              {[
                "Use exact exam names so reporting remains consistent.",
                "Scores are validated between 0 and 100.",
                "After submission, the form resets for the next student.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </TeacherPageShell>
  );
};

export default MarksEntry;
