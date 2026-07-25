import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import { useAuth } from "../../context/AuthContext";
import { logProfileUpdate } from "../../lib/activityLogger";
import supabase from "../../lib/supabase";

type ProfileForm = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  bio: string;
  avatar_url: string;
  role: string;
  approval_status: string;
};

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();

  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    email: "",
    phone: "",
    country: "",
    website: "",
    bio: "",
    avatar_url: "",
    role: "",
    approval_status: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email, phone, country, website, bio, avatar_url, role, approval_status")
        .eq("id", user.id)
        .single();

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setForm({
        full_name: data.full_name ?? "",
        email: data.email ?? user.email ?? "",
        phone: data.phone ?? "",
        country: data.country ?? "",
        website: data.website ?? "",
        bio: data.bio ?? "",
        avatar_url: data.avatar_url ?? "",
        role: data.role ?? profile?.role ?? "user",
        approval_status: data.approval_status ?? profile?.approval_status ?? "pending",
      });

      setLoading(false);
    };

    void loadProfile();
  }, [user, profile?.role, profile?.approval_status]);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be smaller than 5 MB.");
      return;
    }

    setUploadingAvatar(true);
    setProfileMessage("");
    setError("");

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filePath = `${user.id}/avatar-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) {
      setUploadingAvatar(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-images").getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setUploadingAvatar(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    updateField("avatar_url", publicUrl);
    await refreshProfile();
    await logProfileUpdate(user.id);

    setProfileMessage("Profile picture updated successfully.");
  };

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError("You must be logged in to update your profile.");
      return;
    }

    setSavingProfile(true);
    setProfileMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null,
        country: form.country.trim() || null,
        website: form.website.trim() || null,
        bio: form.bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSavingProfile(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await refreshProfile();
    await logProfileUpdate(user.id);

    setProfileMessage("Profile information saved successfully.");
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordMessage("");
    setError("");

    if (newPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSavingPassword(true);

    const { error: passwordError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSavingPassword(false);

    if (passwordError) {
      setError(passwordError.message);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password changed successfully.");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Account
          </p>
          <h1 className="mt-2 text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
            Manage your personal information, profile picture, and password.
          </p>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-col items-center text-center">
              <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-zinc-100 bg-zinc-200 dark:border-zinc-800 dark:bg-zinc-800">
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt={form.full_name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-zinc-500">
                    {(form.full_name || form.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <h2 className="mt-4 text-xl font-bold">{form.full_name || "User"}</h2>
              <p className="mt-1 break-all text-sm text-zinc-500 dark:text-zinc-400">
                {form.email}
              </p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                  {form.role}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {form.approval_status}
                </span>
              </div>

              <label className="mt-6 cursor-pointer rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700">
                {uploadingAvatar ? "Uploading..." : "Change Profile Picture"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>

              <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
                JPG, PNG, or WebP. Maximum size: 5 MB.
              </p>

              {profileMessage && (
                <p className="mt-4 text-sm text-emerald-600">{profileMessage}</p>
              )}
            </div>
          </aside>

          <div className="space-y-6">
            <form
              onSubmit={handleProfileSubmit}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <h2 className="text-2xl font-bold">Personal Information</h2>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(event) => updateField("full_name", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-3 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) => updateField("phone", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={(event) => updateField("country", event.target.value)}
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(event) => updateField("website", event.target.value)}
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">Bio</label>
                <textarea
                  value={form.bio}
                  onChange={(event) => updateField("bio", event.target.value)}
                  rows={6}
                  className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>

            <form
              onSubmit={handlePasswordSubmit}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8"
            >
              <h2 className="text-2xl font-bold">Change Password</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Use at least six characters for the new password.
              </p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
                    required
                  />
                </div>
              </div>

              {passwordMessage && (
                <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={savingPassword}
                className="mt-6 rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {savingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}