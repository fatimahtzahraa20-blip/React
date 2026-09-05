import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createTeacher } from "@/features/admin/api/admin.api";
import { deleteTeacher, updateTeacher } from "@/features/admin/api/teacher-admin.api";
import { getBatches } from "@/features/shared/api/catalog.api";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database.types";

interface TeacherRow {
  id: string; profile_id: string; employee_id: string; specialization: string | null; joining_date: string;
  profiles: Profile | null; teacher_batches: { batch_id: string; batches: { name: string } | null }[];
}

async function getTeacherRows() {
  const { data, error } = await supabase.from("teachers").select("*,profiles(*),teacher_batches(batch_id,batches(name))").order("created_at", { ascending: false });
  if (error) throw error;
  return data as unknown as TeacherRow[];
}

export function TeachersManagementPage() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<TeacherRow | "new" | null>(null);
  const [search, setSearch] = useState("");
  const teachers = useQuery({ queryKey: ["teachers"], queryFn: getTeacherRows });
  const batches = useQuery({ queryKey: ["batches"], queryFn: getBatches });
  const refresh = () => {
    client.invalidateQueries({ queryKey: ["teachers"] });
    client.invalidateQueries({ queryKey: ["users-with-roles"] });
  };
  const create = useMutation({ mutationFn: createTeacher, onSuccess: () => { refresh(); setEditor(null); toast.success("Teacher account created"); }, onError: (error) => toast.error(error.message) });
  const update = useMutation({ mutationFn: updateTeacher, onSuccess: () => { refresh(); setEditor(null); toast.success("Teacher updated"); }, onError: (error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: deleteTeacher, onSuccess: () => { refresh(); toast.success("Teacher record deleted"); }, onError: (error) => toast.error(error.message) });
  const filtered = useMemo(() => (teachers.data ?? []).filter((teacher) =>
    `${teacher.profiles?.full_name ?? ""} ${teacher.employee_id} ${teacher.specialization ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  ), [teachers.data, search]);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const shared = {
      fullName: String(form.get("fullName")), phone: String(form.get("phone")), employeeId: String(form.get("employeeId")),
      specialization: String(form.get("specialization")), joiningDate: String(form.get("joiningDate")), batchIds: form.getAll("batchIds").map(String),
    };
    if (editor === "new") create.mutate({ ...shared, email: String(form.get("email")), password: String(form.get("password")) });
    else if (editor) update.mutate({ ...shared, id: editor.id, profileId: editor.profile_id });
  }
  const current = editor === "new" ? null : editor;
  return <>
    <PageHeader title="Teachers" description="Create, edit, assign, search, and manage teaching staff." actions={<Button onClick={() => setEditor("new")}><Plus /> Add teacher</Button>} />
    <section className="panel table-panel">
      <div className="table-toolbar"><label className="table-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search teacher, ID, or specialization" /></label></div>
      {teachers.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : <div className="teacher-table">
        <div className="teacher-row teacher-row--head"><span>Teacher</span><span>Employee ID</span><span>Specialization</span><span>Assigned batches</span><span /></div>
        {filtered.map((teacher) => <div className="teacher-row" key={teacher.id}>
          <div className="student-cell"><div className="avatar">{teacher.profiles?.full_name.slice(0, 2).toUpperCase()}</div><span><strong>{teacher.profiles?.full_name}</strong><small>{teacher.profiles?.email}</small></span></div>
          <span>{teacher.employee_id}</span><span>{teacher.specialization || "-"}</span><span>{teacher.teacher_batches.map((item) => item.batches?.name).filter(Boolean).join(", ") || "Unassigned"}</span>
          <div className="row-actions"><button onClick={() => setEditor(teacher)}><Edit3 /></button><button onClick={() => confirm("Delete this teacher record?") && remove.mutate(teacher.id)}><Trash2 /></button></div>
        </div>)}
      </div>}
      {!teachers.isLoading && !filtered.length && <div className="empty-state"><h3>No teachers found</h3><p>Create a teacher or change the search.</p></div>}
    </section>
    <Modal open={Boolean(editor)} onClose={() => setEditor(null)} title={current ? "Edit teacher" : "Create teacher account"}>
      <form className="form" onSubmit={submit} key={current?.id ?? "new"}>
        <label>Full name<input name="fullName" defaultValue={current?.profiles?.full_name} required /></label>
        {!current && <><label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" type="password" minLength={8} required /></label></>}
        <label>Phone<input name="phone" defaultValue={current?.profiles?.phone ?? ""} /></label><label>Employee ID<input name="employeeId" defaultValue={current?.employee_id} required /></label>
        <label>Specialization<input name="specialization" defaultValue={current?.specialization ?? ""} /></label><label>Joining date<input name="joiningDate" type="date" defaultValue={current?.joining_date} required /></label>
        <label className="form__wide">Assigned batches<select name="batchIds" multiple size={Math.min(6, Math.max(3, batches.data?.length ?? 3))} defaultValue={current?.teacher_batches.map((item) => item.batch_id)}>{batches.data?.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button disabled={create.isPending || update.isPending}>{(create.isPending || update.isPending) && <LoaderCircle className="spin" />} {current ? "Save teacher" : "Create teacher"}</Button></div>
      </form>
    </Modal>
  </>;
}

