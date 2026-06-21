import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const menuItems = [
    {
      to: "/admin/students",
      label: "Manage Students",
      icon: "👨‍🎓",
      desc: "Add, edit, and track student records.",
      color: "from-blue-500 to-indigo-500",
    },
    {
      to: "/admin/teachers",
      label: "Manage Teachers",
      icon: "👨‍🏫",
      desc: "Create and maintain teacher accounts.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      to: "/admin/subjects",
      label: "Assign Subjects",
      icon: "📚",
      desc: "Map subjects to the right teachers.",
      color: "from-amber-500 to-orange-500",
    },
    {
      to: "/admin/reports",
      label: "View Reports",
      icon: "📈",
      desc: "Analyze class averages and grade spreads.",
      color: "from-rose-500 to-pink-500",
    },
  ];

  const highlights = [
    {
      label: "Academic Control",
      value: "Centralized",
      hint: "Users and subjects in one place",
    },
    {
      label: "Quick Actions",
      value: "4 Modules",
      hint: "Jump directly to the required admin workflow",
    },
    {
      label: "Security",
      value: "Role Protected",
      hint: "Admin routes are permission-checked",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-8 shadow-xl shadow-slate-900/30">
        <div className="pointer-events-none absolute -top-14 right-0 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-14 left-10 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Welcome back. Use the control center below to manage students,
          teachers, and subject assignments.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-5 shadow-md"
          >
            <p className="text-xs uppercase tracking-wider text-slate-400">
              {item.label}
            </p>
            <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
            <p className="mt-1 text-sm text-slate-400">{item.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group rounded-xl border border-slate-700/70 bg-slate-900/75 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-500 hover:shadow-xl"
          >
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} text-2xl shadow-lg`}
            >
              {item.icon}
            </div>
            <h3 className="text-lg font-semibold text-white transition-colors group-hover:text-sky-300">
              {item.label}
            </h3>
            <p className="mt-1 text-sm text-slate-400">{item.desc}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-sky-400">
              Open module
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;