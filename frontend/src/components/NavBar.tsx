import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { normalizeRole } from "../utils/role";

const Navbar = () => {
  const { logout, user } = useAuth();
  const role = normalizeRole(user?.role);
  const linksByRole = {
    admin: [
      { to: "/admin/dashboard", label: "Dashboard" },
      { to: "/admin/students", label: "Students" },
      { to: "/admin/teachers", label: "Teachers" },
      { to: "/admin/subjects", label: "Subjects" },
      { to: "/admin/reports", label: "Reports" },
    ],
    teacher: [
      { to: "/teacher/dashboard", label: "Dashboard" },
      { to: "/teacher/subjects", label: "Subjects" },
      { to: "/teacher/marks", label: "Marks" },
      { to: "/teacher/report", label: "Reports" },
    ],
    student: [
      { to: "/students/profile", label: "Profile" },
      { to: "/students/marks", label: "Marks" },
    ],
  } as const;
  const links = role ? linksByRole[role] : [];

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-lg shadow-lg shadow-sky-500/30">
            🎓
          </div>
          <div className="hidden sm:block">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Student Performance Analysis
            </p>
            <p className="text-sm font-semibold text-white">Academic Portal</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {user?.role !== "student" && (
            <span className="hidden text-sm text-slate-300 lg:block">
              {user?.email}
            </span>
          )}
          <button
            onClick={logout}
            className="group relative flex h-11 w-11 cursor-pointer items-center justify-start overflow-hidden rounded-full border-none bg-gradient-to-r from-indigo-500 to-rose-500 shadow-lg shadow-indigo-900/40 transition-all duration-300 hover:w-32 hover:rounded-2xl active:translate-y-px"
          >
            <div className="flex w-full items-center justify-center transition-all duration-300 group-hover:w-[34%] group-hover:pl-3">
              <svg viewBox="0 0 512 512" className="w-4.25">
                <path
                  fill="white"
                  d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"
                />
              </svg>
            </div>
            <span className="absolute right-0 w-0 text-[0.95rem] font-semibold text-white opacity-0 transition-all duration-300 group-hover:w-[66%] group-hover:pr-3 group-hover:opacity-100">
              Logout
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;