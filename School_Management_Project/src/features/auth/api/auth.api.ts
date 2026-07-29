import { supabase } from "@/lib/supabase";
import type { AppRole, Profile } from "@/types/database.types";
import type { AuthUser, LoginInput, SignupInput } from "../types/auth.types";

export async function signIn(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) throw error;
  return data;
}

export async function signUp(input: SignupInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email, password: input.password,
    options: { data: { full_name: input.fullName } },
  });
  if (error) throw error;
  return data;
}

export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAuthUser(userId: string): Promise<Omit<AuthUser, "user">> {
  const [profileResult, rolesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("profile_roles").select("roles(name)").eq("profile_id", userId),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (rolesResult.error) throw rolesResult.error;
  const roles = (rolesResult.data ?? []).flatMap((item) => {
    const role = item.roles as unknown as { name: AppRole } | null;
    return role ? [role.name] : [];
  });
  return { profile: profileResult.data as Profile, roles };
}
