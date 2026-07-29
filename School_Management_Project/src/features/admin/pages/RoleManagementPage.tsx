import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, Search, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import type { AppRole, Profile } from "@/types/database.types";

interface UserRow extends Profile {
  profile_roles: { roles: { name: AppRole } | null }[];
}

async function getUsers() {
  const { data, error } = await supabase.from("profiles").select("*,profile_roles(roles(name))").order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as UserRow[];
}

async function setRole({ profileId, role }: { profileId: string; role: AppRole }) {
  const { data: roleRow, error: roleError } = await supabase.from("roles").select("id").eq("name", role).single();
  if (roleError) throw roleError;
  const { error: deleteError } = await supabase.from("profile_roles").delete().eq("profile_id", profileId);
  if (deleteError) throw deleteError;
  const { error } = await supabase.from("profile_roles").insert({ profile_id: profileId, role_id: roleRow.id });
  if (error) throw error;
}

async function setActive({ profileId, active }: { profileId: string; active: boolean }) {
  const { error } = await supabase.from("profiles").update({ is_active: active }).eq("id", profileId);
  if (error) throw error;
}

export function RoleManagementPage() {
  const client = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [search, setSearch] = useState("");
  const users = useQuery({ queryKey: ["users-with-roles"], queryFn: getUsers });
  const refresh = () => client.invalidateQueries({ queryKey: ["users-with-roles"] });
  const updateRole = useMutation({
    mutationFn: setRole,
    onSuccess: () => { refresh(); toast.success("User role updated"); },
    onError: (error) => toast.error(error.message),
  });
  const updateActive = useMutation({
    mutationFn: setActive,
    onSuccess: () => { refresh(); toast.success("Account status updated"); },
    onError: (error) => toast.error(error.message),
  });
  const filtered = useMemo(() => (users.data ?? []).filter((profile) =>
    `${profile.full_name} ${profile.email}`.toLowerCase().includes(search.toLowerCase()),
  ), [users.data, search]);
  return <>
    <PageHeader title="Users and roles" description="Search accounts, assign roles, and control access." />
    <section className="panel table-panel">
      <div className="table-toolbar"><label className="table-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" /></label></div>
      {users.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : <div className="role-table">{filtered.map((profile) => {
        const role = profile.profile_roles[0]?.roles?.name ?? "student";
        const isSelf = profile.id === currentUser?.id;
        return <div className="role-row role-row--complete" key={profile.id}>
          <div className="avatar"><ShieldCheck /></div>
          <span><strong>{profile.full_name}</strong><small>{profile.email}</small></span>
          <span className={`badge badge--${profile.is_active ? "active" : "inactive"}`}>{profile.is_active ? "Active" : "Inactive"}</span>
          <select value={role} disabled={updateRole.isPending || isSelf} title={isSelf ? "You cannot change your own role" : "Change role"} onChange={(event) => {
            const nextRole = event.target.value as AppRole;
            if (confirm(`Change this account's role to ${nextRole.replace("_", " ")}?`)) updateRole.mutate({ profileId: profile.id, role: nextRole });
          }}>
            <option value="super_admin">Super Admin</option><option value="admin">Admin</option><option value="teacher">Teacher</option><option value="student">Student</option>
          </select>
          <Button variant="secondary" size="sm" disabled={isSelf || updateActive.isPending} onClick={() => updateActive.mutate({ profileId: profile.id, active: !profile.is_active })}>
            {profile.is_active ? <UserX /> : <UserCheck />}{profile.is_active ? "Deactivate" : "Activate"}
          </Button>
        </div>;
      })}</div>}
      {!users.isLoading && !filtered.length && <div className="empty-state"><h3>No matching users</h3><p>Try a different name or email.</p></div>}
    </section>
  </>;
}
