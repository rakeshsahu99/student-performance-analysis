import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { normalizeRole } from "../utils/role";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "requestReset" | "confirmReset">(
    "login",
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      login(token, user);

      const role = normalizeRole(user.role);

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "teacher") {
        navigate("/teacher", { replace: true });
      } else {
        navigate("/students", { replace: true });
      }
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Login failed");
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/request-password-reset", { email });
      const tokenFromDevResponse = res.data?.resetToken as string | undefined;
      if (tokenFromDevResponse) {
        setResetToken(tokenFromDevResponse);
        setMessage(
          "Reset token generated for development. Use it below to set a new password.",
        );
      } else {
        setMessage("If the account exists, reset instructions have been sent.");
      }
      setMode("confirmReset");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Request failed");
      } else {
        setError("Request failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token: resetToken,
        password,
      });
      setMessage("Password reset successful. You can sign in now.");
      setPassword("");
      setResetToken("");
      setMode("login");
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || "Reset failed");
      } else {
        setError("Reset failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <form
        onSubmit={
          mode === "login"
            ? handleLogin
            : mode === "requestReset"
              ? handleRequestPasswordReset
              : handleResetPassword
        }
        className="relative z-10 flex w-full max-w-[460px] flex-col gap-4 rounded-3xl border border-white/10 bg-slate-900/80 p-8 font-sans shadow-2xl shadow-indigo-900/30 backdrop-blur-xl"
      >
        <div className="mb-1">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Student Performance Analysis</p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            {mode === "login"
              ? "Welcome back"
              : mode === "requestReset"
                ? "Reset your password"
                : "Set a new password"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === "login"
              ? "Sign in to access your dashboard."
              : mode === "requestReset"
                ? "Enter your email to request a reset token."
                : "Use your reset token and new password."}
          </p>
        </div>
        {message && (
          <div className="mb-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3">
            <p className="text-sm text-emerald-300">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex flex-col">
          <label className="font-semibold text-slate-200">Email</label>
        </div>

        <div className="flex h-[52px] items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 transition duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/30">
          <svg
            height="20"
            viewBox="0 0 32 32"
            width="20"
            xmlns="http://www.w3.org/2000/svg"
            className="text-slate-400"
          >
            <g id="Layer_3" data-name="Layer 3">
              <path
                fill="currentColor"
                d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"
              />
            </g>
          </svg>
          <input
            type="email"
            className="ml-2 h-full w-full rounded-xl border-none bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode === "confirmReset" && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-200">Reset Token</label>
            </div>
            <div className="flex h-[52px] items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 transition duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/30">
              <input
                type="text"
                className="h-full w-full rounded-xl border-none bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                placeholder="Paste reset token"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                required
              />
            </div>
          </>
        )}

        {mode !== "requestReset" && (
          <>
            <div className="flex flex-col">
              <label className="font-semibold text-slate-200">Password</label>
            </div>

            <div className="flex h-[52px] items-center rounded-xl border border-slate-700 bg-slate-800/80 px-3 transition duration-200 focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-500/30">
              <svg
                height="20"
                viewBox="-64 0 512 512"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
                className="text-slate-400"
              >
                <path
                  fill="currentColor"
                  d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"
                />
                <path
                  fill="currentColor"
                  d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"
                />
              </svg>
              <input
                type={showPassword ? "text" : "password"}
                className="ml-2 h-full w-full rounded-xl border-none bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
                placeholder={
                  mode === "login" ? "Enter your Password" : "Enter new Password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="ml-2 text-slate-400 transition hover:text-slate-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 3L21 21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.58 10.58C10.21 10.95 10 11.46 10 12C10 13.1 10.9 14 12 14C12.54 14 13.05 13.79 13.42 13.42"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.88 5.09C10.56 4.9 11.27 4.8 12 4.8C16.2 4.8 19.53 7.6 21 12C20.45 13.65 19.57 15.08 18.44 16.2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6.68 6.69C4.98 7.82 3.62 9.63 3 12C4.47 16.4 7.8 19.2 12 19.2C13.52 19.2 14.95 18.84 16.22 18.17"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    height="20"
                    width="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 12C2.73 7.61 6.72 4.8 12 4.8C17.28 4.8 21.27 7.61 23 12C21.27 16.39 17.28 19.2 12 19.2C6.72 19.2 2.73 16.39 1 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </button>
            </div>
          </>
        )}


        <button
          type="submit"
          disabled={loading}
          className="mb-1 mt-4 h-[50px] w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 text-[15px] font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
              ? "Sign In"
              : mode === "requestReset"
                ? "Request Reset"
                : "Reset Password"}
        </button>

        <div className="mt-1 flex items-center justify-between text-sm text-slate-400">
          {mode === "login" ? (
            <button
              type="button"
              className="hover:text-sky-300"
              onClick={() => {
                setMode("requestReset");
                setError("");
                setMessage("");
                setPassword("");
              }}
            >
              Forgot password?
            </button>
          ) : (
            <button
              type="button"
              className="hover:text-sky-300"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
                setResetToken("");
              }}
            >
              Back to sign in
            </button>
          )}

          {mode === "requestReset" && (
            <button
              type="button"
              className="hover:text-sky-300"
              onClick={() => {
                setMode("confirmReset");
                setError("");
                setMessage("");
              }}
            >
              I already have a token
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default LoginPage;