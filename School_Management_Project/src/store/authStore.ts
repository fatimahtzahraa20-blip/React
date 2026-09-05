import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import type { AppRole, Profile } from "@/types/database.types";

interface AuthState {
  user: User | null; profile: Profile | null; roles: AppRole[]; initialized: boolean;
  setAuth: (user: User | null, profile?: Profile | null, roles?: AppRole[]) => void;
  setInitialized: (initialized: boolean) => void; clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null, profile: null, roles: [], initialized: false,
  setAuth: (user, profile = null, roles = []) => set({ user, profile, roles }),
  setInitialized: (initialized) => set({ initialized }),
  clear: () => set({ user: null, profile: null, roles: [] }),
}));
