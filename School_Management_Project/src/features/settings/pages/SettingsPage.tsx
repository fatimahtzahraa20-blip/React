import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Image as ImageIcon, LockKeyhole, Moon, Save, UserRound } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { z } from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { getInstituteSettings, saveInstituteSettings } from "@/features/shared/api/instituteSettings.api";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/services/storage.service";
import { useAuthStore } from "@/store/authStore";

const profileSchema = z.object({ fullName: z.string().min(2), phone: z.string().max(30).optional() });
const passwordSchema = z.object({
  password: z.string().min(8, "Use at least 8 characters"),
  confirmPassword: z.string(),
}).refine((value) => value.password === value.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
const instituteSchema = z.object({ instituteName: z.string().min(2, "Enter at least 2 characters").max(60) });
type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type InstituteForm = z.infer<typeof instituteSchema>;

export function SettingsPage() {
  const { profile, setAuth, user, roles } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const isAdmin = roles.includes("super_admin") || roles.includes("admin");
  const [logoUploading, setLogoUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema), defaultValues: { fullName: profile?.full_name ?? "", phone: profile?.phone ?? "" } });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const instituteForm = useForm<InstituteForm>({ resolver: zodResolver(instituteSchema) });
  const institute = useQuery({
    queryKey: ["institute-settings"],
    queryFn: async () => {
      const data = await getInstituteSettings();
      instituteForm.reset({ instituteName: data.institute_name });
      return data;
    },
    enabled: isAdmin,
  });
  const preferences = useQuery({
    queryKey: ["preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("profile_id", user!.id).maybeSingle();
      if (error) throw error;
      return data ?? { profile_id: user!.id, email_notifications: true, assignment_notifications: true, attendance_notifications: true };
    },
    enabled: Boolean(user?.id),
  });
  const saveProfile = useMutation({
    mutationFn: async (input: ProfileForm) => {
      const { data, error } = await supabase.from("profiles").update({ full_name: input.fullName, phone: input.phone || null }).eq("id", user!.id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { setAuth(user, data, roles); toast.success("Profile updated"); },
    onError: (error) => toast.error(error.message),
  });
  const changePassword = useMutation({
    mutationFn: async (input: PasswordForm) => {
      const { error } = await supabase.auth.updateUser({ password: input.password });
      if (error) throw error;
    },
    onSuccess: () => { passwordForm.reset(); toast.success("Password changed"); },
    onError: (error) => toast.error(error.message),
  });
  const savePreferences = useMutation({
    mutationFn: async (input: { email_notifications: boolean; assignment_notifications: boolean; attendance_notifications: boolean }) => {
      const { data, error } = await supabase.from("user_preferences").upsert({ profile_id: user!.id, ...input }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => { preferences.refetch(); toast.success("Notification preferences saved"); return data; },
    onError: (error) => toast.error(error.message),
  });
  const saveInstituteName = useMutation({
    mutationFn: async (input: InstituteForm) => saveInstituteSettings({ institute_name: input.instituteName }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["institute-settings"] }); toast.success("Institute name updated"); },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Apply migration 005 to enable institute branding."),
  });
  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    setLogoUploading(true);
    try {
      const uploaded = await uploadFile("branding", user.id, file);
      const { data: publicUrl } = supabase.storage.from("branding").getPublicUrl(uploaded.path);
      await saveInstituteSettings({ institute_name: institute.data?.institute_name ?? "School", logo_url: publicUrl.publicUrl });
      queryClient.invalidateQueries({ queryKey: ["institute-settings"] });
      toast.success("Logo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Apply migration 005 to enable institute branding.");
    } finally {
      setLogoUploading(false);
    }
  }

  return <>
    <PageHeader title="Settings" description="Manage your profile, security, theme, and notifications." />
    <section className="settings-grid">
      <nav className="panel settings-nav"><a href="#profile"><UserRound /> Profile</a><a href="#security"><LockKeyhole /> Security</a><a href="#appearance"><Moon /> Appearance</a><a href="#notifications"><Bell /> Notifications</a>{isAdmin && <a href="#institute"><ImageIcon /> Institute</a>}</nav>
      <div className="settings-content">
        <article id="profile" className="panel settings-section"><h2>Profile</h2><p>Keep your contact information current.</p><form onSubmit={profileForm.handleSubmit((value) => saveProfile.mutate(value))}>
          <label>Full name<input {...profileForm.register("fullName")} />{profileForm.formState.errors.fullName && <small>{profileForm.formState.errors.fullName.message}</small>}</label>
          <label>Email<input value={profile?.email ?? ""} disabled /></label>
          <label>Phone<input {...profileForm.register("phone")} /></label>
          <Button disabled={saveProfile.isPending}><Save /> Save changes</Button>
        </form></article>
        <article id="security" className="panel settings-section"><h2>Password</h2><p>Choose a strong, unique password for your account.</p><form onSubmit={passwordForm.handleSubmit((value) => changePassword.mutate(value))}>
          <label>New password<input {...passwordForm.register("password")} type="password" autoComplete="new-password" />{passwordForm.formState.errors.password && <small>{passwordForm.formState.errors.password.message}</small>}</label>
          <label>Confirm password<input {...passwordForm.register("confirmPassword")} type="password" autoComplete="new-password" />{passwordForm.formState.errors.confirmPassword && <small>{passwordForm.formState.errors.confirmPassword.message}</small>}</label>
          <Button disabled={changePassword.isPending}>Change password</Button>
        </form></article>
        <article id="appearance" className="panel settings-section"><h2>Appearance</h2><p>Choose how {institute.data?.institute_name ?? "School"} appears on this device.</p><select value={theme} onChange={(event) => setTheme(event.target.value)}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></article>
        <article id="notifications" className="panel settings-section"><h2>Notifications</h2><p>Choose which institute updates you want to receive.</p>
          {preferences.error ? <div className="inline-error">Apply migration 003 to enable persistent notification preferences.</div> : <form onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            savePreferences.mutate({
              email_notifications: form.get("email") === "on",
              assignment_notifications: form.get("assignments") === "on",
              attendance_notifications: form.get("attendance") === "on",
            });
          }}>
            <label className="setting-toggle"><span><strong>Email updates</strong><small>Important account and institute messages</small></span><input name="email" type="checkbox" defaultChecked={preferences.data?.email_notifications ?? true} /></label>
            <label className="setting-toggle"><span><strong>Assignment updates</strong><small>New assignments, submissions, and reviews</small></span><input name="assignments" type="checkbox" defaultChecked={preferences.data?.assignment_notifications ?? true} /></label>
            <label className="setting-toggle"><span><strong>Attendance updates</strong><small>Attendance status and report changes</small></span><input name="attendance" type="checkbox" defaultChecked={preferences.data?.attendance_notifications ?? true} /></label>
            <Button disabled={savePreferences.isPending}><Save /> Save preferences</Button>
          </form>}
        </article>
        {isAdmin && <article id="institute" className="panel settings-section"><h2>Institute</h2><p>Set the name and logo shown across the login page and sidebar for everyone.</p>
          {institute.error ? <div className="inline-error">Apply migration 005 (institute_settings) to enable this section.</div> : <>
            <form onSubmit={instituteForm.handleSubmit((value) => saveInstituteName.mutate(value))}>
              <label>Institute name<input {...instituteForm.register("instituteName")} placeholder="School" />{instituteForm.formState.errors.instituteName && <small>{instituteForm.formState.errors.instituteName.message}</small>}</label>
              <Button disabled={saveInstituteName.isPending}><Save /> Save name</Button>
            </form>
            <label style={{ marginTop: 18, display: "block" }}>Logo
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                {institute.data?.logo_url ? <img src={institute.data.logo_url} alt="Institute logo" style={{ width: 44, height: 44, borderRadius: 11, objectFit: "cover", border: "1px solid var(--line)" }} /> : null}
                <input ref={logoInputRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleLogoUpload} disabled={logoUploading} />
              </div>
            </label>
          </>}
        </article>}
      </div>
    </section>
  </>;
}
