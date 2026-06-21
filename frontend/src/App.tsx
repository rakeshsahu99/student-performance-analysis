import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";

import Login from "./pages/auth/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/NavBar";

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageTeachers = lazy(() => import("./pages/admin/ManageTeachers"));
const AssignSubjects = lazy(() => import("./pages/admin/AssignSubjects"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const TeacherSubjects = lazy(() => import("./pages/teacher/TeacherSubjects"));
const TeacherMarks = lazy(() => import("./pages/teacher/TeacherMarks"));
const TeacherReport = lazy(() => import("./pages/teacher/TeacherReport"));
const Students = lazy(() => import("./pages/students/Students"));
const Marks = lazy(() => import("./pages/marks/Marks"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
  </div>
);

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-transparent">
      {showNavbar && <Navbar />}
      <main
        className={
          showNavbar
            ? "mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8"
            : ""
        }
      >
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute role="admin">
                  <ManageStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute role="admin">
                  <ManageTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute role="admin">
                  <AssignSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute role="admin">
                  <AdminReports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/teacher"
              element={<Navigate to="/teacher/dashboard" replace />}
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/subjects"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherSubjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/marks"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherMarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/report"
              element={
                <ProtectedRoute role="teacher">
                  <TeacherReport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={<Navigate to="/students/profile" replace />}
            />
            <Route
              path="/students/report"
              element={<Navigate to="/students/profile" replace />}
            />
            <Route
              path="/students/profile"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students/marks"
              element={
                <ProtectedRoute>
                  <Marks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
