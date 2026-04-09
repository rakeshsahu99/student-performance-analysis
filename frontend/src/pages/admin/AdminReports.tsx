import { useState, useEffect } from "react";
import api from "../../api/axios";

interface SubjectStats {
  subject: string;
  total_entries: number;
  average: number;
}

interface TopStudent {
  name: string;
  avg_marks: number;
}

interface Mark {
  id: string | number;
  student_name: string;
  subject: string;
  exam: string;
  marks_obtained: number;
}

interface Summary {
  total_students: number;
  total_marks_entries: number;
  overall_average: string;
  subject_stats: SubjectStats[];
  top_students: TopStudent[];
}

const AdminReports = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marks, setMarks] = useState<Mark[]>([]);
  const [activeTab, setActiveTab] = useState<"summary" | "details">("summary");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, marksRes] = await Promise.all([
        api.get("/marks/summary"),
        api.get("/marks"),
      ]);
      setSummary(summaryRes.data);
      setMarks(marksRes.data);
      setError("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to fetch reports");
      } else {
        setError("Failed to fetch reports");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statsCards = summary
    ? [
        { label: "Total Students", value: summary.total_students, icon: "👨‍🎓" },
        {
          label: "Total Marks Entries",
          value: summary.total_marks_entries,
          icon: "📝",
        },
        {
          label: "Overall Average",
          value: `${summary.overall_average}%`,
          icon: "📊",
        },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          View performance analytics and reports
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(["summary", "details"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab === "summary" ? "📈 Summary" : "📋 All Marks"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
        </div>
      ) : activeTab === "summary" && summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subject-wise Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Total Entries</th>
                    <th className="px-6 py-3">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {summary.subject_stats.map((stat, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {stat.subject}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {stat.total_entries}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent-500 rounded-full"
                              style={{ width: `${stat.average}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.average
                              ? parseFloat(stat.average.toFixed(1))
                              : 0}
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top 5 Students
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="px-6 py-3">Rank</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Average Marks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {summary.top_students.map((student, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            idx === 0
                              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : idx === 1
                                ? "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                : idx === 2
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "text-gray-500"
                          }`}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {parseFloat(student.avg_marks.toFixed(1))}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {summary.top_students.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "details" ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Marks Details
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="px-6 py-3">Student</th>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">Exam</th>
                  <th className="px-6 py-3">Marks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {marks.map((mark) => (
                  <tr
                    key={mark.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {mark.student_name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {mark.subject}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {mark.exam}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-sm font-medium bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded">
                        {mark.marks_obtained}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {marks.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No marks found
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminReports;
