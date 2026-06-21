import { useMemo, useState, useEffect } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import api from "../../api/axios";
import { GRADE_COLORS, GRADE_ORDER, sharedBarOptions, sharedPieOptions } from "../../components/reporting/chartTheme";

interface SubjectData {
  id: number;
  name: string;
  average: string;
  highest: string;
  lowest: string;
}

interface TeacherAnalytics {
  subjects: SubjectData[];
  totalStudents: number;
  averagePercentage: string;
  passRate: string;
  passCount: number;
  failCount: number;
  grade_distribution?: GradeDistributionItem[];
}

interface GradeDistributionItem {
  grade: string;
  count: number;
}

interface MarkEntry {
  student_id: number;
  branch: string;
  subject: string;
  marks_obtained: number;
}

const MAX_MARKS = 20;

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const TeacherReport = () => {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marks, setMarks] = useState<MarkEntry[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("All Branches");

  const availableBranches = useMemo(
    () => Array.from(new Set(marks.map((mark) => mark.branch).filter(Boolean))).sort(),
    [marks],
  );

  const filteredMarks = useMemo(
    () =>
      selectedBranch === "All Branches"
        ? marks
        : marks.filter((mark) => mark.branch === selectedBranch),
    [marks, selectedBranch],
  );

  const subjectPerformance = useMemo(() => {
    if (filteredMarks.length > 0) {
      const bySubject = new Map<
        string,
        { total: number; count: number; highest: number; lowest: number }
      >();

      filteredMarks.forEach((mark) => {
        const percentage = (Number(mark.marks_obtained || 0) / MAX_MARKS) * 100;
        const current = bySubject.get(mark.subject) ?? {
          total: 0,
          count: 0,
          highest: Number.NEGATIVE_INFINITY,
          lowest: Number.POSITIVE_INFINITY,
        };

        current.total += percentage;
        current.count += 1;
        current.highest = Math.max(current.highest, percentage);
        current.lowest = Math.min(current.lowest, percentage);
        bySubject.set(mark.subject, current);
      });

      return [...bySubject.entries()].map(([name, stats]) => ({
        name,
        average: (stats.total / stats.count).toFixed(2),
        highest: stats.highest.toFixed(2),
        lowest: stats.lowest.toFixed(2),
      }));
    }

    return analytics?.subjects ?? [];
  }, [analytics?.subjects, filteredMarks]);

  const subjectBarData = useMemo(
    () => ({
      labels: subjectPerformance.map((subject) => subject.name) ?? [], 
      datasets: [
        {
          label: "Class Average %",
          data: subjectPerformance.map((subject) => parseFloat(subject.average)) ?? [],
          backgroundColor: "rgba(14, 165, 233, 0.82)",
          borderRadius: 0,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
        {
          label: "Highest % in Subject",
          data: subjectPerformance.map((subject) => parseFloat(subject.highest)) ?? [],
          backgroundColor: "rgba(34, 197, 94, 0.82)",
          borderRadius: 0,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
        {
          label: "Lowest % in Subject",
          data: subjectPerformance.map((subject) => parseFloat(subject.lowest)) ?? [],
          backgroundColor: "rgba(239, 68, 68, 0.82)",
          borderRadius: 0,
          borderSkipped: false,
          barPercentage: 0.55,
          categoryPercentage: 0.7,
        },
      ],
    }),
    [subjectPerformance],
  );

  const subjectBarOptions = useMemo(
    () => ({
      ...sharedBarOptions,
      scales: {
        ...sharedBarOptions.scales,
        x: {
          ...sharedBarOptions.scales?.x,
          title: {
            display: true,
            text: "Subjects",
            color: "#64748b",
          },
        },
        y: {
          ...sharedBarOptions.scales?.y,
          title: {
            display: true,
            text: "Percentage %",
            color: "#64748b",
          },
          stacked: false,
        },
      },
    }),
    [],
  );

  const gradeDistribution = useMemo(() => {
    const computedFromMarks = filteredMarks.length > 0;

    const counts = computedFromMarks
      ? filteredMarks.reduce<Record<string, number>>((acc, mark) => {
          const percentage = (Number(mark.marks_obtained || 0) / MAX_MARKS) * 100;
          let grade = "F";

          if (percentage >= 90) grade = "A+";
          else if (percentage >= 80) grade = "A";
          else if (percentage >= 70) grade = "B+";
          else if (percentage >= 60) grade = "B";
          else if (percentage >= 50) grade = "C+";
          else if (percentage >= 40) grade = "C";
          else if (percentage >= 30) grade = "D";

          acc[grade] = (acc[grade] ?? 0) + 1;
          return acc;
        }, {})
      : Object.fromEntries(
          (analytics?.grade_distribution ?? []).map((item) => [item.grade, item.count]),
        );

    return GRADE_ORDER.map((grade) => ({
      grade,
      count: counts[grade] ?? 0,
    }));
  }, [analytics?.grade_distribution, filteredMarks]);

  const hasGradeData = useMemo(
    () => gradeDistribution.some((item) => item.count > 0),
    [gradeDistribution],
  );

  const gradePieData = useMemo(
    () => ({
      labels: gradeDistribution.filter((item) => item.count > 0).map((item) => item.grade),
      datasets: [
        {
          label: "Grade distribution",
          data: gradeDistribution.filter((item) => item.count > 0).map((item) => item.count),
          backgroundColor: gradeDistribution
            .filter((item) => item.count > 0)
            .map((item) => GRADE_COLORS[item.grade]),
          borderColor: "#ffffff",
          borderWidth: 3,
        },
      ],
    }),
    [gradeDistribution],
  );

  const summaryMetrics = useMemo(() => {
    const markPercentages = filteredMarks.map(
      (mark) => (Number(mark.marks_obtained || 0) / MAX_MARKS) * 100,
    );
    const totalStudents = new Set(filteredMarks.map((mark) => mark.student_id)).size;
    const subjectCount = new Set(filteredMarks.map((mark) => mark.subject)).size;
    const passCount = markPercentages.filter((percentage) => percentage >= 30).length;
    const failCount = markPercentages.filter((percentage) => percentage < 30).length;
    const averagePercentage =
      markPercentages.length > 0
        ? (markPercentages.reduce((sum, value) => sum + value, 0) / markPercentages.length).toFixed(2)
        : analytics?.averagePercentage ?? "0.00";

    return {
      totalStudents,
      subjectCount,
      averagePercentage,
      passCount,
      failCount,
      passRate:
        passCount + failCount > 0
          ? ((passCount / (passCount + failCount)) * 100).toFixed(2)
          : "0.00",
    };
  }, [analytics?.averagePercentage, filteredMarks]);

  const topSubject = useMemo(() => {
    if (!subjectPerformance.length) return "N/A";
    return [...subjectPerformance].sort((a, b) => parseFloat(b.average) - parseFloat(a.average))[0]?.name ?? "N/A";
  }, [subjectPerformance]);

  const lowestSubject = useMemo(() => {
    if (!subjectPerformance.length) return "N/A";
    return [...subjectPerformance].sort((a, b) => parseFloat(a.average) - parseFloat(b.average))[0]?.name ?? "N/A";
  }, [subjectPerformance]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [analyticsRes, marksRes] = await Promise.all([
          api.get("/analytics/teacher-view"),
          api.get<MarkEntry[]>("/marks/teacher-view"),
        ]);

        setAnalytics(analyticsRes.data);
        setMarks(marksRes.data);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
          </div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-500 dark:text-gray-400">
            No teaching assignments found yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Classroom Performance Report
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Comprehensive analytics for your taught subjects
        </p>
      </div>

      <div className="mb-6 rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Branch filter
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a branch to update the bar and pie charts below.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBranch("All Branches")}
            className={`rounded-lg px-4 py-2 font-medium transition ${
              selectedBranch === "All Branches"
                ? "bg-accent-500 text-white"
                : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            }`}
          >
            All Branches
          </button>
          {availableBranches.map((branch) => (
            <button
              key={branch}
              onClick={() => setSelectedBranch(branch)}
              className={`rounded-lg px-4 py-2 font-medium transition ${
                selectedBranch === branch
                  ? "bg-accent-500 text-white"
                  : "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              }`}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      {/* Overall Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Students
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {summaryMetrics.totalStudents}
          </p>
          <span className="text-2xl mt-2 block">👥</span>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Average Percentage
          </p>
          <p className="text-3xl font-bold text-accent-600 dark:text-accent-400 mt-1">
            {summaryMetrics.averagePercentage}%
          </p>
          <div className="mt-2 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-500 rounded-full"
              style={{ width: `${Math.min(parseFloat(summaryMetrics.averagePercentage), 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400">Pass Rate</p>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {summaryMetrics.passRate}%
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            {summaryMetrics.passCount} passed • {summaryMetrics.failCount} failed
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr] mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Subject performance spread
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Three rectangular bars per subject show the class average, subject high, and subject low at the same time.
            </p>
          </div>
          <div className="h-80 rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
            <Bar data={subjectBarData} options={subjectBarOptions} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Grade distribution
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Pie chart for A+ through F bands across your assigned subjects.
            </p>
          </div>
          <div className="h-[500px] rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
            {hasGradeData ? (
              <Pie data={gradePieData} options={sharedPieOptions} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-white/70 text-center dark:border-slate-700 dark:bg-slate-950/40">
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No grade data available yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Add marks for assigned subjects to populate this pie chart.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-xl p-6 border border-accent-200 dark:border-accent-800 mt-6">
        <h3 className="text-lg font-bold text-accent-900 dark:text-accent-100 mb-3">
          📊 Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-accent-800 dark:text-accent-200">
          <li>
            • Average classroom performance:{" "}
            <strong>{summaryMetrics.averagePercentage}%</strong>
          </li>
          <li>
            • Pass rate: <strong>{summaryMetrics.passRate}%</strong> (
            {summaryMetrics.passCount} students passing)
          </li>
          <li>
            • Top subject:{" "}
            <strong>
              {topSubject}
            </strong>
          </li>
          <li>
            • Lowest subject: <strong>{lowestSubject}</strong>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TeacherReport;
