import supabase from "../lib/supabase";

export type AccountRole = "admin" | "user";

type AccountProfile = {
  role: AccountRole;
  approval_status: "pending" | "approved" | "rejected";
  is_active: boolean;
};

export type SignInResult = {
  success: boolean;
  message: string;
  role?: AccountRole;
  redirectPath?: "/admin" | "/dashboard";
};

export async function signInUser(
  email: string,
  password: string
): Promise<SignInResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return {
      success: false,
      message: "Please enter your email and password.",
    };
  }

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

  if (authError) {
    return {
      success: false,
      message:
        authError.message === "Invalid login credentials"
          ? "Incorrect email or password."
          : authError.message,
    };
  }

  if (!authData.user || !authData.session) {
    return {
      success: false,
      message: "The signed-in account could not be loaded.",
    };
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("role, approval_status, is_active")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError) {
    await supabase.auth.signOut();

    return {
      success: false,
      message: profileError.message,
    };
  }

  if (!profileData) {
    await supabase.auth.signOut();

    return {
      success: false,
      message:
        "Your authentication account exists, but its profile was not found.",
    };
  }

  const account = profileData as AccountProfile;

  if (!account.is_active) {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your account has been disabled by the administrator.",
    };
  }

  if (account.approval_status === "pending") {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your account is waiting for administrator approval.",
    };
  }

  if (account.approval_status === "rejected") {
    await supabase.auth.signOut();

    return {
      success: false,
      message: "Your account request has been rejected.",
    };
  }

  if (account.role === "admin") {
    return {
      success: true,
      message: "Admin login successful.",
      role: "admin",
      redirectPath: "/admin",
    };
  }

  return {
    success: true,
    message: "User login successful.",
    role: "user",
    redirectPath: "/dashboard",
  };
}