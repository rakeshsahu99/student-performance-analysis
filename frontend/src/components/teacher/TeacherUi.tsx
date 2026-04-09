import { Link } from "react-router-dom";
import type { ReactElement, ReactNode, SVGProps } from "react";

type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement;

interface PageShellProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}

interface SectionCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

interface HeroMetricProps {
  label: string;
  value: string;
}

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: IconComponent;
  tone?: "blue" | "emerald" | "amber" | "slate";
}

interface ActionCardProps {
  to: string;
  title: string;
  description: string;
  icon: IconComponent;
  meta?: string;
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon: IconComponent;
}

interface NoticeProps {
  title: string;
  message: string;
  tone?: "error" | "success";
}

const toneMap: Record<NonNullable<StatCardProps["tone"]>, string> = {
  blue: "from-sky-500/18 via-cyan-500/10 to-white text-sky-700 ring-sky-500/20 dark:from-sky-400/20 dark:via-cyan-400/12 dark:to-slate-950 dark:text-sky-200 dark:ring-sky-400/20",
  emerald:
    "from-emerald-500/18 via-teal-500/10 to-white text-emerald-700 ring-emerald-500/20 dark:from-emerald-400/20 dark:via-teal-400/12 dark:to-slate-950 dark:text-emerald-200 dark:ring-emerald-400/20",
  amber:
    "from-amber-500/18 via-orange-500/10 to-white text-amber-700 ring-amber-500/20 dark:from-amber-400/20 dark:via-orange-400/12 dark:to-slate-950 dark:text-amber-200 dark:ring-amber-400/20",
  slate:
    "from-slate-500/12 via-slate-400/8 to-white text-slate-700 ring-slate-400/20 dark:from-slate-400/15 dark:via-slate-300/10 dark:to-slate-950 dark:text-slate-200 dark:ring-slate-300/20",
};

export const TeacherPageShell = ({
  eyebrow = "Teacher workspace",
  title,
  description,
  actions,
  children,
}: PageShellProps) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#eef4ff_52%,_#f8fafc_100%)] px-4 py-6 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_24%),linear-gradient(180deg,_#020617_0%,_#0f172a_58%,_#020617_100%)] dark:text-slate-50 sm:px-6 lg:px-8">
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
      <section className="overflow-hidden rounded-[28px] border border-white/70 bg-slate-950 px-6 py-7 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.65)] ring-1 ring-slate-900/5 dark:border-white/10 dark:bg-slate-900 sm:px-8">
        <div className="absolute" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-200">
              {eyebrow}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {description}
            </p>
          </div>
          {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </section>
      {children}
    </div>
  </div>
);

export const HeroMetrics = ({ items }: { items: HeroMetricProps[] }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
    {items.map((item) => (
      <div
        key={item.label}
        className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
      >
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-300">
          {item.label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
      </div>
    ))}
  </div>
);

export const SectionCard = ({
  title,
  description,
  action,
  children,
  className = "",
}: SectionCardProps) => (
  <section
    className={`rounded-[26px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/82 ${className}`.trim()}
  >
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
    {children}
  </section>
);

export const StatCard = ({
  label,
  value,
  hint,
  icon: Icon,
  tone = "slate",
}: StatCardProps) => (
  <div className="group rounded-[24px] border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_-34px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900/80">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{hint}</p>
        ) : null}
      </div>
      <div
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${toneMap[tone]} ring-1`}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export const ActionCard = ({
  to,
  title,
  description,
  icon: Icon,
  meta,
}: ActionCardProps) => (
  <Link
    to={to}
    className="group relative overflow-hidden rounded-[26px] border border-slate-200/75 bg-white/90 p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:shadow-[0_30px_70px_-36px_rgba(14,165,233,0.35)] dark:border-slate-800 dark:bg-slate-900/82 dark:hover:border-sky-900/80"
  >
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 opacity-80" />
    <div className="flex items-start justify-between gap-4">
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
        <Icon className="h-5 w-5" />
      </div>
      <ArrowRightIcon className="mt-1 h-5 w-5 text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-sky-500 dark:text-slate-600" />
    </div>
    <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
      {title}
    </h3>
    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
    {meta ? (
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
        {meta}
      </p>
    ) : null}
  </Link>
);

export const EmptyState = ({
  title,
  description,
  icon: Icon,
}: EmptyStateProps) => (
  <div className="rounded-[26px] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center shadow-[0_20px_50px_-40px_rgba(15,23,42,0.4)] dark:border-slate-700 dark:bg-slate-900/70">
    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
      {title}
    </h3>
    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
      {description}
    </p>
  </div>
);

export const Notice = ({ title, message, tone = "error" }: NoticeProps) => {
  const toneClass =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/80 dark:bg-emerald-950/40 dark:text-emerald-200"
      : "border-rose-200 bg-rose-50/90 text-rose-900 dark:border-rose-900/80 dark:bg-rose-950/40 dark:text-rose-200";

  return (
    <div className={`rounded-2xl border px-4 py-4 ${toneClass}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm opacity-90">{message}</p>
    </div>
  );
};

export const PageActionLink = ({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: IconComponent;
}) => (
  <Link
    to={to}
    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/16"
  >
    <Icon className="h-4 w-4" />
    {label}
  </Link>
);

export const PageActionButton = ({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: IconComponent;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/30 hover:bg-white/16"
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

export const DashboardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 13.5h6.5V20H4zM13.5 4H20v7.5h-6.5zM13.5 13.5H20V20h-6.5zM4 4h6.5v6.5H4z" />
  </svg>
);

export const BookIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21z" />
    <path d="M5 5.5v15" />
    <path d="M9 7h6M9 11h6" />
  </svg>
);

export const PencilSquareIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z" />
    <path d="M12 6H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-7" />
  </svg>
);

export const ChartBarIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const TrophyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a2 2 0 0 0 2 2h1M17 6h3a2 2 0 0 1-2 2h-1" />
  </svg>
);

export const CheckBadgeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="m9 12 2 2 4-5" />
    <path d="M12 3 8.5 5l-4 1v5c0 5 3.4 8.4 7.5 10 4.1-1.6 7.5-5 7.5-10V6l-4-1z" />
  </svg>
);

export const ClipboardListIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M9 3h6l1 2h3v16H5V5h3z" />
    <path d="M9 3v3h6V3M9 11h6M9 15h6" />
  </svg>
);

export const RefreshIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M20 11a8 8 0 1 0 2.2 5.5" />
    <path d="M20 4v7h-7" />
  </svg>
);

export const SparklesIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="m12 3 1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8z" />
  </svg>
);

export const ArrowRightIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
