import { useState, useEffect } from "react";
import api from "../../api/axios";

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Assignment {
  id: number;
  teacher_name: string;
  email: string;
  subject_name: string;
  subject_code?: string | null;
}

const AssignSubjects = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: "",
    subject_name: "",
    subject_code: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teachersRes, assignmentsRes] = await Promise.all([
        api.get("/users/teachers"),
        api.get("/assignments"),
      ]);
      setTeachers(teachersRes.data);
      setAssignments(assignmentsRes.data);
      setError("");
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subjectName = formData.subject_name.trim();
    const subjectCode = formData.subject_code.trim();
    if (!formData.teacher_id || (!subjectName && !subjectCode)) {
      setError("Please select a teacher and enter a subject name or code");
      return;
    }
    try {
      await api.post("/assignments", {
        teacher_id: parseInt(formData.teacher_id),
        subject_name: subjectName,
        subject_code: subjectCode,
      });
      setShowModal(false);
      setFormData({ teacher_id: "", subject_name: "", subject_code: "" });
      fetchData();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to assign subject");
      } else {
        setError("Failed to assign subject");
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assign Subjects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Assign subjects to teachers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + Assign Subject
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6 py-4">Teacher Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Subject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{assignment.teacher_name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{assignment.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full">
                        {assignment.subject_name}
                        {assignment.subject_code ? ` (${assignment.subject_code})` : ""}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {assignments.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No assignments found
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assign Subject to Teacher</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Teacher</label>
                <select
                  value={formData.teacher_id}
                  onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select a teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Subject</label>
                <input
                  type="text"
                  value={formData.subject_name}
                  onChange={(e) => setFormData({ ...formData, subject_name: e.target.value })}
                  className="input"
                  placeholder="Enter a new subject or type an existing one"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Type a subject name directly. If it already exists, it will be reused.
                </p>
              </div>
              <div>
                <label className="label">Subject Code</label>
                <input
                  type="text"
                  value={formData.subject_code}
                  onChange={(e) => setFormData({ ...formData, subject_code: e.target.value.toUpperCase() })}
                  className="input uppercase"
                  placeholder="Enter an alphanumeric subject code"
                  pattern="[A-Za-z0-9]+"
                  title="Use only letters and numbers"
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Use letters and numbers only, for example `MATH101` or `CS201`.
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignSubjects;
