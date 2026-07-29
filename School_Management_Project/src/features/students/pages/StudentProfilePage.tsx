import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, LoaderCircle, Mail, MapPin, Phone, Save, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { uploadFile } from "@/services/storage.service";
import { useAuthStore } from "@/store/authStore";
import type { StudentRecord } from "@/types/database.types";

async function getMyStudentProfile(profileId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*,profiles(*),courses(name,code),batches(name,timing)")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as StudentRecord | null;
}

export function StudentProfilePage() {
  const { user, profile, roles, setAuth } = useAuthStore();
  const client = useQueryClient();
  const [editing, setEditing] = useState(false);
  const query = useQuery({
    queryKey: ["my-student-profile", user?.id],
    queryFn: () => getMyStudentProfile(user!.id),
    enabled: Boolean(user?.id),
  });
  const save = useMutation({
    mutationFn: async ({ phone, address, avatar }: { phone: string; address: string; avatar?: File }) => {
      let avatarUrl = profile?.avatar_url ?? null;
      if (avatar) {
        const uploaded = await uploadFile("avatars", user!.id, avatar);
        const { data } = supabase.storage.from("avatars").getPublicUrl(uploaded.path);
        avatarUrl = data.publicUrl;
      }
      const { data: profileData, error: profileError } = await supabase.from("profiles").update({
        phone: phone || null,
        avatar_url: avatarUrl,
      }).eq("id", user!.id).select().single();
      if (profileError) throw profileError;
      if (query.data) {
        const { error: studentError } = await supabase.from("students").update({ address: address || null }).eq("id", query.data.id);
        if (studentError) throw studentError;
      }
      return profileData;
    },
    onSuccess: (nextProfile) => {
      setAuth(user, nextProfile, roles);
      client.invalidateQueries({ queryKey: ["my-student-profile"] });
      setEditing(false);
      toast.success("Profile updated");
    },
    onError: (error) => toast.error(error.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      phone: String(form.get("phone") ?? ""),
      address: String(form.get("address") ?? ""),
      avatar: (event.currentTarget.elements.namedItem("avatar") as HTMLInputElement).files?.[0],
    });
  }
  if (query.isLoading) return <div className="route-loader"><LoaderCircle className="spin" /></div>;
  if (!query.data) return <div className="panel empty-state"><UserRound /><h3>Student record not connected</h3><p>Ask an administrator to complete your course and batch enrollment.</p></div>;
  const student = query.data;
  const fields = [
    ["Father name", student.father_name],
    ["Application ID", student.application_id],
    ["Course", `${student.courses?.name ?? "—"} (${student.courses?.code ?? "—"})`],
    ["Batch", student.batches?.name ?? "—"],
    ["Timing", student.batches?.timing ?? "—"],
    ["Enrollment date", new Date(student.enrollment_date).toLocaleDateString()],
  ];
  return <>
    <PageHeader title="My profile" description="Your personal and academic enrollment information." actions={!editing ? <Button onClick={() => setEditing(true)}>Edit profile</Button> : undefined} />
    <section className="student-profile-grid">
      <article className="panel student-profile-identity">
        <div className="profile-photo">{profile?.avatar_url ? <img src={profile.avatar_url} alt={profile.full_name} /> : <span>{profile?.full_name.slice(0, 2).toUpperCase()}</span>}</div>
        <h2>{profile?.full_name}</h2><p>{student.application_id}</p><span className="badge badge--active">Student</span>
        <div><Mail />{profile?.email}</div><div><Phone />{profile?.phone || "No phone added"}</div><div><MapPin />{student.address || "No address added"}</div>
      </article>
      <article className="panel student-profile-details">
        <header><h2>Student information</h2><p>Official institute enrollment record</p></header>
        <div>{fields.map(([label, value]) => <section key={label}><span>{label}</span><strong>{value}</strong></section>)}</div>
      </article>
    </section>
    {editing && <article className="panel settings-section profile-edit-panel"><h2>Edit contact details</h2><p>Your academic details can only be changed by an administrator.</p><form onSubmit={submit}>
      <label>Phone<input name="phone" defaultValue={profile?.phone ?? ""} /></label>
      <label>Profile picture<span className="file-input-label"><Camera /> Choose image<input name="avatar" type="file" accept="image/jpeg,image/png,image/webp" /></span></label>
      <label className="form__wide">Address<input name="address" defaultValue={student.address ?? ""} /></label>
      <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button><Button disabled={save.isPending}><Save /> Save profile</Button></div>
    </form></article>}
  </>;
}
