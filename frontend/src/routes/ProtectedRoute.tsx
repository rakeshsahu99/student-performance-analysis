import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react/jsx-dev-runtime";
import { normalizeRole } from "../utils/role";

interface Props {
  children: JSX.Element;
  role?: "admin" | "teacher" | "student";
}

const ProtectedRoute = ({ children, role }: Props) => {
  const { user, token } = useAuth();
  const userRole = normalizeRole(user?.role);

  if (!token) {
    return <Navigate to="/" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
