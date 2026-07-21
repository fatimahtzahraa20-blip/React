export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: "admin" | "user";
  created_at?: string;
}