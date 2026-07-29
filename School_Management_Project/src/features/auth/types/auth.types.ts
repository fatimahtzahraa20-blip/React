import type { User } from "@supabase/supabase-js";
import type { AppRole, Profile } from "@/types/database.types";

export interface AuthUser { user: User; profile: Profile; roles: AppRole[]; }
export interface LoginInput { email: string; password: string; }
export interface SignupInput extends LoginInput { fullName: string; }
