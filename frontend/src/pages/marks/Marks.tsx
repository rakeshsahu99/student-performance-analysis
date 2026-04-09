import { useState, useEffect } from "react";
import api from "../../api/axios";

interface MarkEntry {
  id: number;
  subject: string;
  exam: string;
  marks_obtained: number;
}

interface ExamData {
  exam: string;
  marks: number;
}

interface AnalyticsResponse {
  subject_wise: Record<string, ExamData[]>;
}

const Marks = () => {
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        const res = await api.get("/students/me");
        const studentData = res.data;
        
        if (studentData && studentData.id) {
          const analyticsRes = await api.get<AnalyticsResponse>(`/analytics/${studentData.id}`);
          const analytics = analyticsRes.data;
          
          const marksData: MarkEntry[] = [];
          for (const [subject, exams] of Object.entries(analytics.subject_wise || {})) {
            exams.forEach((exam) => {
              marksData.push({
                id: Math.random(),
                subject,
                exam: exam.exam,
                marks_obtained: exam.marks,
              });
            });
          }
          setMarks(marksData);
        }
        setError("");
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'response' in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error || "Failed to fetch marks");
        } else {
          setError("Failed to fetch marks");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
      </div>
    );
  }

  const getMarksColor = (marks: number) => {
    if (marks >= 90) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (marks >= 60) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (marks >= 40) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getMarksGrade = (marks: number) => {
    if (marks >= 90) return "A+";
    if (marks >= 80) return "A";
    if (marks >= 70) return "B+";
    if (marks >= 60) return "B";
    if (marks >= 50) return "C";
    if (marks >= 40) return "D";
    return "F";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Marks</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View your examination marks</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {marks.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Exam</th>
                  <th className="px-6 py-4">Marks</th>
                  <th className="px-6 py-4">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {marks.map((mark) => (
                  <tr key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{mark.subject}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{mark.exam}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              mark.marks_obtained >= 60 ? "bg-green-500" :
                              mark.marks_obtained >= 40 ? "bg-amber-500" : "bg-red-500"
                            }`}
                            style={{ width: `${mark.marks_obtained}%` }}
                          />
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMarksColor(mark.marks_obtained)}`}>
                          {mark.marks_obtained}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-bold ${
                        mark.marks_obtained >= 60 ? "text-green-600 dark:text-green-400" :
                        mark.marks_obtained >= 40 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"
                      }`}>
                        {getMarksGrade(mark.marks_obtained)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">📝</div>
          <p className="text-gray-500 dark:text-gray-400">No marks available yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Your marks will appear here once your teachers enter them.
          </p>
        </div>
      )}
    </div>
  );
};

export default Marks;