import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  session: Session | null;
}

export async function login(
  credentials: LoginCredentials
): Promise<AuthResult> {
  const email = credentials.email.trim();

  if (!email) {
    throw new Error("Email address is required.");
  }

  if (!credentials.password) {
    throw new Error("Password is required.");
  }

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password: credentials.password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

export async function logout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getCurrentSession() {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

export async function getCurrentUser() {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export function subscribeToAuthChanges(
  callback: (
    user: User | null,
    session: Session | null
  ) => void
) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      callback(session?.user ?? null, session);
    }
  );

  return () => {
    subscription.unsubscribe();
  };
}

export async function sendPasswordResetEmail(
  email: string
) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error("Email address is required.");
  }

  const redirectTo = `${window.location.origin}/reset-password`;

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo,
      }
    );

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function updatePassword(
  password: string
) {
  if (password.length < 6) {
    throw new Error(
      "Password must contain at least 6 characters."
    );
  }

  const { data, error } =
    await supabase.auth.updateUser({
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function updateEmail(
  email: string
) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error("Email address is required.");
  }

  const { data, error } =
    await supabase.auth.updateUser({
      email: cleanEmail,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data.user;
}

export async function isAuthenticated() {
  const session = await getCurrentSession();

  return Boolean(session?.user);
}