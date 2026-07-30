import { supabase } from "@/lib/supabase";

export async function login(email, password) {
  const signInResult = await supabase.auth.signInWithPassword({ email, password });
  if (!signInResult.error) return { ...signInResult, created: false };

  const invalidCredentials = signInResult.error.code === "invalid_credentials"
    || /invalid login credentials/i.test(signInResult.error.message);
  if (!invalidCredentials) return signInResult;

  const signUpResult = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: email.split("@")[0] } },
  });
  if (signUpResult.error) return signUpResult;
  if (!signUpResult.data.session) {
    return {
      data: signUpResult.data,
      error: new Error("Account created, but email confirmation is enabled. Disable Confirm email in Supabase Authentication settings for instant access."),
    };
  }
  return { ...signUpResult, created: true };
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  return await supabase.auth.getSession();
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback);
}