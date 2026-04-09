export type AppRole = "admin" | "teacher" | "student";

export const normalizeRole = (role?: string | null): AppRole | null => {
  if (!role) return null;
  const normalized = role.trim().toLowerCase();

  if (normalized === "admin" || normalized === "teacher" || normalized === "student") {
    return normalized;
  }

  return null;
};
