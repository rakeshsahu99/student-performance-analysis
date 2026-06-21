import { useEffect, useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { AxiosError } from "axios";
import api from "../../api/axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ChartBarIcon,
  CheckBadgeIcon,
  Notice,
  SectionCard,
  StatCard,
  TeacherPageShell,
  TrophyIcon,
  UsersIcon,
} from "../../components/teacher/TeacherUi";
import { sharedBarOptions, sharedPieOptions } from "../../components/reporting/chartTheme";

interface SubjectData {
  name: string;
  average: string;
}

interface AnalyticsReport {
  subjects: SubjectData[];
  totalStudents: number;
  averagePercentage: string;
  passRate: string;
  passCount: number;
  failCount: number;
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const SubjectAnalytics = () => {
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get<AnalyticsReport>("/analytics/teacher-view");
        setReport(response.data);
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: string; message?: string }>;
        setError(
          axiosError.response?.data?.error ||
            axiosError.response?.data?.message ||
            "Failed to fetch analytics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const subjectLeader = useMemo(() => {
    if (!report?.subjects.length) return "N/A";
    return [...report.subjects].sort((a, b) => parseFloat(b.average) - parseFloat(a.average))[0].name;
  }, [report]);

  if (loading) {
    return (
      <TeacherPageShell
        eyebrow="Performance analytics"
        title="Loading classroom analytics."
        description="Preparing subject averages, pass rates, and student performance trends."
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-[340px] animate-pulse rounded-[26px] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70" />
          <div className="h-[340px] animate-pulse rounded-[26px] border border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/70" />
        </div>
      </TeacherPageShell>
    );
  }

  if (error) {
    return (
      <TeacherPageShell
        eyebrow="Performance analytics"
        title="Analytics could not be loaded."
        description="The page shell is ready, but the reporting data request did not complete successfully."
      >
        <Notice title="Analytics request failed" message={error} />
      </TeacherPageShell>
    );
  }

  if (!report) return null;

  const barData = {
    labels: report.subjects.map((s) => s.name),
    datasets: [
      {
        label: "Average Marks",
        data: report.subjects.map((s) => parseFloat(s.average)),
        backgroundColor: ["rgba(14, 165, 233, 0.8)", "rgba(6, 182, 212, 0.8)", "rgba(16, 185, 129, 0.8)", "rgba(245, 158, 11, 0.78)", "rgba(99, 102, 241, 0.75)"],
        borderRadius: 14,
        borderSkipped: false,
      },
    ],
  };

  const pieData = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        label: "Performance Distribution",
        data: [report.passCount, report.failCount],
        backgroundColor: ["#10b981", "#f97316"],
        borderColor: ["#ecfeff", "#fff7ed"],
        borderWidth: 3,
      },
    ],
  };

  return (
    <TeacherPageShell
      eyebrow="Performance analytics"
      title="Track classroom outcomes with a sharper reporting experience."
      description="This analytics page now presents teacher performance data with stronger hierarchy, clearer stat cards, and more premium chart containers."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Students" value={String(report.totalStudents)} hint="Students included in the analytics snapshot" icon={UsersIcon} tone="blue" />
        <StatCard label="Average Percentage" value={`${report.averagePercentage}%`} hint="Combined performance across tracked subjects" icon={TrophyIcon} tone="emerald" />
        <StatCard label="Pass Rate" value={`${report.passRate}%`} hint={`${report.passCount} passed and ${report.failCount} below 30%`} icon={CheckBadgeIcon} tone="amber" />
        <StatCard label="Top Subject" value={subjectLeader} hint="Highest current average" icon={ChartBarIcon} tone="slate" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <SectionCard
          title="Subject averages"
          description="A cleaner bar chart makes performance differences between subjects easier to compare."
        >
          <div className="h-80 rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
            <Bar data={barData} options={sharedBarOptions} />
          </div>
        </SectionCard>

        <SectionCard
          title="Pass and fail split"
          description="Distribution is highlighted with a more presentation-friendly chart card using a 30% fail cutoff."
        >
          <div className="h-80 rounded-[22px] bg-slate-50 p-4 dark:bg-slate-950/50">
            <Pie data={pieData} options={sharedPieOptions} />
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Subject performance summary"
        description="A compact summary list gives each subject a more readable, professional treatment below the charts."
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {report.subjects.map((subject) => (
            <div
              key={subject.name}
              className="rounded-[22px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                  {subject.name}
                </h3>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                  Avg {subject.average}
                </span>
              </div>
               <div className="mt-5 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                  style={{ width: `${subject.average}%` }}
                />
              </div>
               <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                 {parseFloat(subject.average) >= 75
                   ? "Strong performance trend"
                   : parseFloat(subject.average) >= 30
                     ? "Moderate performance trend"
                     : "Attention recommended"}
               </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </TeacherPageShell>
  );
};

export default SubjectAnalytics;
