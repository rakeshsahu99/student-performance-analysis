import { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../../utils/role";

type Role = "student" | "admin" | "teacher";

const Login = () => {
  const [step, setStep] = useState<"role" | "login">("role");
  const [role, setRole] = useState<Role | "">("");
  const [email, setEmail] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep("login");
  };

  const handleBack = () => {
    setStep("role");
    setRole("");
    setEmail("");
    setRollNumber("");
    setPassword("");
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const payload = {
        role,
        password,
        ...(role === "student" ? { rollNumber } : { email }),
      };

      const res = await api.post("/auth/login", payload);

      const { token, user } = res.data;

      login(token, user);

      const normalizedRole = normalizeRole(user.role);

      if (normalizedRole === "admin") {
        navigate("/admin", { replace: true });
      } else if (normalizedRole === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/students", { replace: true });
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case "admin": return "Admin";
      case "teacher": return "Teacher";
      case "student": return "Student";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md p-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {step === "role" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">What is your Role?</p>
              </div>

              <div className="space-y-4">
                {(["student", "admin", "teacher"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleSelect(r)}
                    className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {getRoleLabel(r)}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              </div>

              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {getRoleLabel(role as Role)} Login
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Sign in to your account</p>
              </div>
          
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-6">
                {role === "student" ? (
                  <div>
                    <label className="label">Registration Number</label>
                    <input
                      type="text"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="input"
                      placeholder="Enter your registration number"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary text-lg py-3"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
        
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          Student Performance & Marks Management System
        </p>
      </div>
    </div>
  );
};

export default Login;