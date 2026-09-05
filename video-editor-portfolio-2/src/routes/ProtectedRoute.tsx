import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { Navigate } from "react-router-dom";

import supabase from "../lib/supabase";
import { useAuth as useAppAuth } from "../context/AuthContext";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "user";
  approval_status: "pending" | "approved" | "rejected";
  can_upload: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type SignUpInput = {
  fullName: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

type AuthResult = {
  success: boolean;
  message: string;
  role?: "admin" | "user";
};

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  signIn: (input: SignInInput) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const clearAuthState = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
  }, []);

  const loadProfile = useCallback(
    async (userId: string): Promise<UserProfile | null> => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, approval_status, can_upload, is_active, created_at, updated_at"
        )
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Profile loading error:", error.message);
        setProfile(null);
        return null;
      }

      if (!data) {
        setProfile(null);
        return null;
      }

      const loadedProfile = data as UserProfile;
      setProfile(loadedProfile);
      return loadedProfile;
    },
    []
  );

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return null;
    }

    return loadProfile(user.id);
  }, [user, loadProfile]);

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      setLoading(true);

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        console.error("Session loading error:", error.message);
        clearAuthState();
        setLoading(false);
        return;
      }

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      if (active) {
        setLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      window.setTimeout(() => {
        void loadProfile(nextSession.user.id).finally(() => {
          if (active) {
            setLoading(false);
          }
        });
      }, 0);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [clearAuthState, loadProfile]);

  const signUp = async ({
    fullName,
    email,
    password,
  }: SignUpInput): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();

    if (!normalizedName) {
      return {
        success: false,
        message: "Please enter your full name.",
      };
    }

    if (!normalizedEmail) {
      return {
        success: false,
        message: "Please enter your email address.",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Password must contain at least 6 characters.",
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
        },
      },
    });

    if (error) {
      return {
        success: false,
        message: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        message: "The account could not be created.",
      };
    }

    const { data: existingProfile, error: profileLookupError } =
      await supabase
        .from("profiles")
        .select("id")
        .eq("id", data.user.id)
        .maybeSingle();

    if (profileLookupError) {
      console.error(
        "Profile lookup error:",
        profileLookupError.message
      );
    }

    if (!existingProfile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: data.user.id,
          full_name: normalizedName,
          email: normalizedEmail,
          role: "user",
          approval_status: "pending",
          can_upload: false,
          is_active: true,
        });

      if (profileError) {
        console.error(
          "Profile creation error:",
          profileError.message
        );
      }
    }

    if (data.session) {
      await supabase.auth.signOut();
      clearAuthState();
    }

    return {
      success: true,
      message:
        "Account created successfully. Verify your email, then wait for administrator approval.",
    };
  };

  const signIn = async ({
    email,
    password,
  }: SignInInput): Promise<AuthResult> => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return {
        success: false,
        message: "Please enter your email and password.",
      };
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message:
          error.message === "Invalid login credentials"
            ? "Incorrect email or password."
            : error.message,
      };
    }

    if (!data.user || !data.session) {
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message: "The signed-in account could not be loaded.",
      };
    }

    setUser(data.user);
    setSession(data.session);

    const currentProfile = await loadProfile(data.user.id);

    if (!currentProfile) {
      await supabase.auth.signOut();
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message:
          "Your authentication account exists, but its profile record was not found.",
      };
    }

    if (!currentProfile.is_active) {
      await supabase.auth.signOut();
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message: "Your account has been disabled by the administrator.",
      };
    }

    if (currentProfile.approval_status === "pending") {
      await supabase.auth.signOut();
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message: "Your account is waiting for administrator approval.",
      };
    }

    if (currentProfile.approval_status === "rejected") {
      await supabase.auth.signOut();
      clearAuthState();
      setLoading(false);

      return {
        success: false,
        message: "Your account request has been rejected.",
      };
    }

    setProfile(currentProfile);
    setLoading(false);

    return {
      success: true,
      message: "",
      role: currentProfile.role,
    };
  };

  const signOut = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign-out error:", error.message);
    }

    clearAuthState();
    setLoading(false);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      isAdmin: profile?.role === "admin",
      signUp,
      signIn,
      signOut,
      refreshProfile,
    }),
    [user, session, profile, loading, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, profile, loading, isAdmin } = useAppAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !profile.is_active || profile.approval_status !== "approved") {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
