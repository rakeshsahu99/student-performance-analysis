export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
}

export interface AuthResponse {
  token: string;
  user: User;
}
