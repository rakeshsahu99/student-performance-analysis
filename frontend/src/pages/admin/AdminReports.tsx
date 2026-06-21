import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import api from "../../api/axios";
import { GRADE_COLORS, GRADE_ORDER, sharedBarOptions, sharedPieOptions } from "../../components/reporting/chartTheme";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface SubjectStats {
  subject: string;
  total_entries: number;
  average: string;
}

interface TopStudent {
  name: string;
  avg_marks: string;
}

interface GradeDistributionItem {
  grade: string;
  count: number;
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
  grade_distribution: GradeDistributionItem[];
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

  const subjectChartData = useMemo(
    () => ({
      labels: summary?.subject_stats.map((stat) => stat.subject) ?? [],
      datasets: [
        {
          label: "Average %",
          data: summary?.subject_stats.map((stat) => parseFloat(stat.average)) ?? [],
          backgroundColor: [
            "rgba(14, 165, 233, 0.82)",
            "rgba(16, 185, 129, 0.82)",
            "rgba(245, 158, 11, 0.82)",
            "rgba(124, 58, 237, 0.82)",
            "rgba(239, 68, 68, 0.82)",
            "rgba(37, 99, 235, 0.82)",
          ],
          borderRadius: 14,
          borderSkipped: false,
        },
      ],
    }),
    [summary],
  );

  const gradeChartData = useMemo(
    () => ({
      labels: GRADE_ORDER,
      datasets: [
        {
          label: "Students",
          data: GRADE_ORDER.map(
            (grade) => summary?.grade_distribution?.find((item) => item.grade === grade)?.count || 0,
          ),
          backgroundColor: GRADE_ORDER.map((grade) => GRADE_COLORS[grade]),
          borderColor: "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [summary],
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reports
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          View performance analytics and reports
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="mb-6 flex gap-2">
        {(["summary", "details"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "bg-accent-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            }`}
          >
            {tab === "summary" ? "📈 Summary" : "📋 All Marks"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-accent-600" />
        </div>
      ) : activeTab === "summary" && summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {statsCards.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                  </div>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Subject averages
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Bar chart for subject-wise performance.
                  </p>
                </div>
              </div>
              <div className="h-80 rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
                <Bar data={subjectChartData} options={sharedBarOptions} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Grade distribution
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pie chart across A+ through F.
                </p>
              </div>
              <div className="h-80 rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
                <Pie data={gradeChartData} options={sharedPieOptions} />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
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
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-accent-500"
                              style={{ width: `${stat.average}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {stat.average}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
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
                          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
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
                        {student.avg_marks}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {summary.top_students.length === 0 && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === "details" ? (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-700">
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
                      <span className="rounded bg-accent-100 px-2 py-1 text-sm font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                        {mark.marks_obtained}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {marks.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
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
