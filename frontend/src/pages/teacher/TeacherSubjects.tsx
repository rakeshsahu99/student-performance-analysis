import { useEffect, useState } from "react";
import api from "../../api/axios";
import {
  BookIcon,
  EmptyState,
  Notice,
  PageActionButton,
  RefreshIcon,
  SectionCard,
  StatCard,
  TeacherPageShell,
} from "../../components/teacher/TeacherUi";

interface Assignment {
  id: number;
  teacher_id: number;
  subject_id: number;
  subject_name: string;
}

const TeacherSubjects = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/assignments/my");
      setAssignments(res.data);
      setError("");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Failed to fetch subjects");
      } else {
        setError("Failed to fetch subjects");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <TeacherPageShell
      eyebrow="Teaching portfolio"
      title="Keep a crisp overview of the subjects you own."
      description="Your assignments are organized into a more professional subject management view with summaries, cleaner cards, and a clearer empty state."
      actions={<PageActionButton label="Refresh subjects" icon={RefreshIcon} onClick={fetchAssignments} />}
    >
      {error ? <Notice title="Unable to load assignments" message={error} /> : null}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          label="Assigned Subjects"
          value={String(assignments.length)}
          hint="Total active subject allocations"
          icon={BookIcon}
          tone="blue"
        />
        <StatCard
          label="Coverage"
          value={assignments.length > 0 ? "Active" : "Pending"}
          hint="Shows whether your teaching portfolio is populated"
          icon={RefreshIcon}
          tone="emerald"
        />
        <StatCard
          label="Workspace Status"
          value={loading ? "Syncing" : "Ready"}
          hint="Latest assignment data from the server"
          icon={BookIcon}
          tone="amber"
        />
      </div>

      <SectionCard
        title="Assigned subject list"
        description="Browse every subject assigned to you with a more structured card layout."
      >
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-[22px] border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : assignments.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {assignments.map((assignment, index) => (
              <article
                key={assignment.id}
                className="rounded-[24px] border border-slate-200/80 bg-gradient-to-br from-white to-slate-50 p-5 shadow-[0_18px_45px_-38px_rgba(15,23,42,0.55)] transition hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(14,165,233,0.4)] dark:border-slate-800 dark:from-slate-900 dark:to-slate-950"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                    <BookIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700 dark:bg-sky-950/60 dark:text-sky-200">
                    Subject {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                  {assignment.subject_name}
                </h3>
                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-slate-500 dark:text-slate-400">Subject ID</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      #{assignment.subject_id}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/70">
                    <p className="text-slate-500 dark:text-slate-400">Assignment</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">Active</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={BookIcon}
            title="No subjects assigned yet"
            description="Once an administrator allocates subjects to you, they will appear here with a cleaner overview layout."
          />
        )}
      </SectionCard>
    </TeacherPageShell>
  );
};

export default TeacherSubjects;
