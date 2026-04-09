import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  ActionCard,
  BookIcon,
  ChartBarIcon,
  ClipboardListIcon,
  HeroMetrics,
  Notice,
  PencilSquareIcon,
  SectionCard,
  StatCard,
  TeacherPageShell,
  TrophyIcon,
  UsersIcon,
} from "../../components/teacher/TeacherUi";

interface Assignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  subject_name: string;
}

interface SubjectData {
  name: string;
  average: number;
}

interface AnalyticsReport {
  subjects: SubjectData[];
  totalStudents: number;
  averagePercentage: number;
  passRate: number;
  passCount: number;
  failCount: number;
}

const TeacherDashboard = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [assignmentsRes, analyticsRes] = await Promise.all([
          api.get<Assignment[]>("/assignments/my"),
          api.get<AnalyticsReport>("/analytics/teacher-view"),
        ]);

        setAssignments(assignmentsRes.data);
        setReport(analyticsRes.data);
        setError("");
      } catch (err: unknown) {
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as { response?: { data?: { error?: string } } };
          setError(axiosErr.response?.data?.error || "Failed to load teacher dashboard");
        } else {
          setError("Failed to load teacher dashboard");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const menuItems = [
    {
      to: "/teacher/subjects",
      label: "Assigned Subjects",
      icon: BookIcon,
      desc: "Review the subjects, sections, and classes under your care.",
      meta: "Teaching portfolio",
    },
    {
      to: "/teacher/marks",
      label: "Marks Entry",
      icon: PencilSquareIcon,
      desc: "Capture exam scores quickly with a streamlined entry workflow.",
      meta: "Assessment workflow",
    },
    {
      to: "/teacher/analytics",
      label: "Performance Analytics",
      icon: ChartBarIcon,
      desc: "Track pass rates, subject averages, and class-level performance trends.",
      meta: "Insight dashboard",
    },
  ];

  const subjectNames = assignments.map((assignment) => assignment.subject_name);
  const averagePercentage = report?.averagePercentage ?? 0;
  const passRate = report?.passRate ?? 0;
  const totalStudents = report?.totalStudents ?? 0;

  const topSubject = useMemo(() => {
    if (!report?.subjects.length) return "Not available";
    return [...report.subjects].sort((a, b) => b.average - a.average)[0].name;
  }, [report]);

  const actionItems = useMemo(() => {
    if (assignments.length === 0) {
      return [
        "No subjects are assigned yet. Ask an administrator to assign your teaching portfolio.",
        "Once subjects are assigned, marks entry and analytics will populate automatically.",
        "Use Assigned Subjects to confirm new allocations after admin updates.",
      ];
    }

    if (totalStudents === 0) {
      return [
        "Your subjects are assigned and ready.",
        "No marks are recorded yet for your current subjects.",
        "Open Marks Entry to start creating assessment records for students.",
      ];
    }

    return [
      `${assignments.length} subject${assignments.length === 1 ? "" : "s"} currently assigned to your account.`,
      `${totalStudents} student${totalStudents === 1 ? "" : "s"} included in the latest analytics snapshot.`,
      `Top performing subject right now: ${topSubject}.`,
    ];
  }, [assignments.length, topSubject, totalStudents]);

  return (
    <TeacherPageShell
      eyebrow="Teacher dashboard"
      title="Manage classes from a live teaching dashboard."
      description="Use this workspace to review your subject portfolio, capture marks, and keep track of student performance with current data from your account."
      actions={
        <Link
          to="/teacher/marks"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-sky-50"
        >
          <ClipboardListIcon className="h-4 w-4" />
          Start marks entry
        </Link>
      }
    >
      <HeroMetrics
        items={[
          { label: "Assigned Subjects", value: String(assignments.length) },
          { label: "Tracked Students", value: String(totalStudents) },
          { label: "Pass Rate", value: `${passRate}%` },
        ]}
      />

      {error ? <Notice title="Dashboard data could not be loaded" message={error} /> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          label="Assigned Subjects"
          value={loading ? "..." : String(assignments.length)}
          hint="Subjects currently linked to your teacher account"
          icon={BookIcon}
          tone="blue"
        />
        <StatCard
          label="Average Percentage"
          value={loading ? "..." : `${averagePercentage}%`}
          hint="Average marks across your recorded subject entries"
          icon={TrophyIcon}
          tone="emerald"
        />
        <StatCard
          label="Students Covered"
          value={loading ? "..." : String(totalStudents)}
          hint="Distinct students represented in your analytics data"
          icon={UsersIcon}
          tone="amber"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {menuItems.map((item) => (
            <ActionCard
              key={item.to}
              to={item.to}
              title={item.label}
              description={item.desc}
              icon={item.icon}
              meta={item.meta}
            />
          ))}
        </div>

        <SectionCard
          title="Current teaching snapshot"
          description="This panel summarizes what needs your attention based on your current assignments and recorded marks."
        >
          <div className="rounded-[22px] bg-gradient-to-br from-sky-600 to-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-100">
              Top subject
            </p>
            <p className="mt-3 text-3xl font-semibold">{topSubject}</p>
            <p className="mt-2 text-sm text-slate-200">
              {subjectNames.length > 0
                ? `Assigned portfolio: ${subjectNames.join(", ")}`
                : "No subjects assigned yet."}
            </p>
          </div>
          <div className="mt-6 space-y-3">
            {actionItems.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300"
              >
                {item}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </TeacherPageShell>
  );
};

export default TeacherDashboard;
