import { Routes, Route, useLocation } from "react-router-dom";
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
const MarksEntry = lazy(() => import("./pages/teacher/MarksEntry"));
const SubjectAnalytics = lazy(() => import("./pages/teacher/SubjectAnalytics"));
const Students = lazy(() => import("./pages/students/Students"));
const Marks = lazy(() => import("./pages/marks/Marks"));
const Reports = lazy(() => import("./pages/reports/Reports"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
  </div>
);

function App() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="dark min-h-screen bg-transparent">
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "mx-auto w-full max-w-[1280px] px-4 py-6 sm:px-6 lg:px-8" : ""}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route
              path="/admin"
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
                  <MarksEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/analytics"
              element={
                <ProtectedRoute role="teacher">
                  <SubjectAnalytics />
                </ProtectedRoute>
              }
            />

            <Route
              path="/students"
              element={
                <ProtectedRoute>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/marks"
              element={
                <ProtectedRoute>
                  <Marks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
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

