import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import {
    TeacherPageShell,
    Notice,
} from "../../components/teacher/TeacherUi";

interface Subject {
    subject_id: number;
    subject_name: string;
}

interface Exam {
    id: number;
    name: string;
}

interface MarkEntry {
    id: number;
    student_id: number;
    subject_id: number;
    exam_id: number;
    student_name: string;
    roll_number: string;
    regd_no: string;
    branch: string;
    subject: string;
    exam: string;
    marks_obtained: number;
}

const TeacherMarks = () => {
    // Data states
    const [marks, setMarks] = useState<MarkEntry[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Filters
    const [branchFilter, setBranchFilter] = useState<string>("");
    const [subjectFilter, setSubjectFilter] = useState<string>("");

    // Entry form state
    const [formData, setFormData] = useState({
        regd_no: "",
        subject_id: "",
        exam_id: "",
        marks_obtained: "",
    });

    // Editing state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editMarks, setEditMarks] = useState<string>("");

    // Fetch all required data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [marksRes, subjectsRes, examsRes] = await Promise.all([
                    api.get<MarkEntry[]>("/marks/teacher-view"),
                    api.get<Subject[]>("/assignments/my"),
                    api.get<Exam[]>("/exams"),
                ]);
                setMarks(marksRes.data);
                setSubjects(subjectsRes.data);
                setExams(examsRes.data);
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
        fetchData();
    }, []);

    // Filter marks based on selected filters
    const filteredMarks = useMemo(() => {
        return marks.filter(m => {
            const branchMatch = !branchFilter || m.branch === branchFilter;
            const subjectMatch = !subjectFilter || m.subject === subjectFilter;
            return branchMatch && subjectMatch;
        });
    }, [marks, branchFilter, subjectFilter]);

    // Get unique branches from data
    const availableBranches = useMemo(() => {
        return Array.from(new Set(marks.map(m => m.branch))).sort();
    }, [marks]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const studentRes = await api.get(`/students/regd/${formData.regd_no}`);
            const student = studentRes.data;

            if (!student || !student.id) {
                throw new Error("Student not found with this registration number");
            }

            await api.post("/marks", {
                student_id: student.id,
                subject_id: parseInt(formData.subject_id),
                exam_id: parseInt(formData.exam_id),
                marks_obtained: parseInt(formData.marks_obtained),
            });
            setSuccess("Marks submitted successfully.");
            setFormData({
                regd_no: "",
                subject_id: "",
                exam_id: "",
                marks_obtained: "",
            });
            // Refresh marks list
            const res = await api.get<MarkEntry[]>("/marks/teacher-view");
            setMarks(res.data);
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

    const handleEdit = (id: number, currentMarks: number) => {
        setEditingId(id);
        setEditMarks(currentMarks.toString());
    };

    const handleUpdate = async (id: number) => {
        try {
            setSubmitting(true);
            const markEntry = marks.find(m => m.id === id);
            if (!markEntry) return;

            await api.put(`/marks/${id}`, {
                student_id: markEntry.student_id,
                subject_id: markEntry.subject_id,
                exam_id: markEntry.exam_id,
                marks_obtained: parseInt(editMarks),
            });

            setSuccess("Marks updated successfully.");
            setEditingId(null);
            setEditMarks("");

            // Refresh marks list
            const res = await api.get<MarkEntry[]>("/marks/teacher-view");
            setMarks(res.data);
        } catch (err: unknown) {
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { error?: string } } };
                setError(axiosErr.response?.data?.error || "Failed to update marks");
            } else {
                setError("Failed to update marks");
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditMarks("");
    };

    return (
        <TeacherPageShell
            eyebrow="Marks workflow"
            title="Enter new marks and browse all records."
            description="Use filters to narrow down by branch or subject, and update existing marks inline."
        >
            {error && <Notice title="Error" message={error} tone="error" />}
            {success && <Notice title="Success" message={success} tone="success" />}

            {loading ? (
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-64"></div>
                    <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            ) : (
                <>
                    {/* Marks Entry Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Marks</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                            <div>
                                <label className="label">Regd No</label>
                                <input
                                    type="text"
                                    value={formData.regd_no}
                                    onChange={(e) => setFormData({ ...formData, regd_no: e.target.value })}
                                    className="input"
                                    placeholder="Enter registration number"
                                    required
                                />
                            </div>

                            <div>
                                <label className="label">Subject</label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map(s => (
                                        <option key={s.subject_id} value={s.subject_id}>
                                            {s.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Exam</label>
                                <select
                                    value={formData.exam_id}
                                    onChange={(e) => setFormData({ ...formData, exam_id: e.target.value })}
                                    className="input"
                                    required
                                >
                                    <option value="">Select exam</option>
                                    {exams.map(e => (
                                        <option key={e.id} value={e.id}>
                                            {e.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="label">Marks (0-20)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="20"
                                    value={formData.marks_obtained}
                                    onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                                    className="input"
                                    placeholder="0-20"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn btn-primary w-full"
                            >
                                {submitting ? "Submitting..." : "Add Marks"}
                            </button>
                        </form>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <label className="font-medium text-slate-700 dark:text-slate-300">
                                Branch:
                            </label>
                            <select
                                value={branchFilter}
                                onChange={(e) => setBranchFilter(e.target.value)}
                                className="border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="">All Branches</option>
                                {availableBranches.map(branch => (
                                    <option key={branch} value={branch}>{branch}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="font-medium text-slate-700 dark:text-slate-300">
                                Subject:
                            </label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500"
                            >
                                <option value="">All Subjects</option>
                                {subjects.map(s => (
                                    <option key={s.subject_id} value={s.subject_name}>{s.subject_name}</option>
                                ))}
                            </select>
                        </div>

                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            Showing {filteredMarks.length} of {marks.length} entries
                        </span>
                    </div>

                    {/* Marks Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="px-6 py-4">#</th>
                                        <th className="px-6 py-4">Regd No</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4">Branch</th>
                                        <th className="px-6 py-4">Subject</th>
                                        <th className="px-6 py-4">Exam</th>
                                        <th className="px-6 py-4">Marks</th>
                                        <th className="px-6 py-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {filteredMarks.map((mark, idx) => (
                                        <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{idx + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{mark.regd_no || '-'}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{mark.student_name}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 text-xs font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full">
                                                    {mark.branch}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{mark.subject}</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{mark.exam}</td>
                                            <td className="px-6 py-4">
                                                {editingId === mark.id ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="20"
                                                        value={editMarks}
                                                        onChange={(e) => setEditMarks(e.target.value)}
                                                        className="w-20 px-2 py-1 border rounded"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                        mark.marks_obtained >= 12
                                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                            : mark.marks_obtained >= 8
                                                                ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    }`}>
                                                        {mark.marks_obtained}/20
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {editingId === mark.id ? (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleUpdate(mark.id)}
                                                            disabled={submitting}
                                                            className="text-sm text-green-600 hover:text-green-800 font-medium"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEdit}
                                                            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEdit(mark.id, mark.marks_obtained)}
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 font-medium"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredMarks.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No marks found for the selected filters.
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </TeacherPageShell>
    );
};

export default TeacherMarks;
