import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, LoaderCircle, Plus, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { createTeacher, deleteBatch, deleteCourse } from "@/features/admin/api/admin.api";
import { getBatches, getBatchesForTeacher, getCourses, getTeachers, saveBatch, saveCourse } from "@/features/shared/api/catalog.api";
import { useAuthStore } from "@/store/authStore";
import type { Batch, Course } from "@/types/database.types";

export function CoursesPage() {
  const client = useQueryClient();
  const [editor, setEditor] = useState<Course | "new" | null>(null);
  const query = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const save = useMutation({
    mutationFn: saveCourse,
    onSuccess: () => { client.invalidateQueries({ queryKey: ["courses"] }); setEditor(null); toast.success("Course saved"); },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => { client.invalidateQueries({ queryKey: ["courses"] }); toast.success("Course deleted"); },
    onError: (error) => toast.error(error.message.includes("foreign key") ? "This course is in use and cannot be deleted." : error.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      id: editor === "new" ? undefined : editor?.id,
      name: String(form.get("name")),
      code: String(form.get("code")),
      description: String(form.get("description")) || null,
      duration_months: Number(form.get("duration")) || null,
      is_active: form.get("active") === "on",
    });
  }
  const current = editor === "new" ? null : editor;
  return <>
    <PageHeader title="Courses" description="Create, edit, activate, and organize academic programs." actions={<Button onClick={() => setEditor("new")}><Plus /> Add course</Button>} />
    <CatalogCards loading={query.isLoading} empty="No courses yet">
      {query.data?.map((course) => <article className="class-card catalog-card" key={course.id}>
        <div className="class-card__color" /><div><span>{course.code}</span><h3>{course.name}</h3><p>{course.duration_months ?? "-"} months | {course.is_active ? "Active" : "Inactive"}</p><small>{course.description}</small></div>
        <div className="catalog-actions"><button onClick={() => setEditor(course)}><Edit3 /></button><button onClick={() => confirm("Delete this course?") && remove.mutate(course.id)}><Trash2 /></button></div>
      </article>)}
    </CatalogCards>
    <Modal open={Boolean(editor)} onClose={() => setEditor(null)} title={current ? "Edit course" : "Add course"}>
      <form className="form" onSubmit={submit} key={current?.id ?? "new"}>
        <label>Name<input name="name" defaultValue={current?.name} required /></label><label>Code<input name="code" defaultValue={current?.code} required /></label>
        <label>Duration in months<input name="duration" type="number" min="1" defaultValue={current?.duration_months ?? ""} /></label>
        <label className="checkbox-line"><input name="active" type="checkbox" defaultChecked={current?.is_active ?? true} /> Active course</label>
        <label className="form__wide">Description<textarea name="description" defaultValue={current?.description ?? ""} /></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button disabled={save.isPending}>Save course</Button></div>
      </form>
    </Modal>
  </>;
}

export function BatchesPage() {
  const { user, roles } = useAuthStore();
  const canManage = roles.includes("super_admin") || roles.includes("admin");
  const client = useQueryClient();
  const [editor, setEditor] = useState<Batch | "new" | null>(null);
  const query = useQuery({
    queryKey: ["batches", canManage ? "all" : user?.id],
    queryFn: () => canManage ? getBatches() : getBatchesForTeacher(user!.id),
    enabled: Boolean(user?.id),
  });
  const courses = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const save = useMutation({
    mutationFn: saveBatch,
    onSuccess: () => { client.invalidateQueries({ queryKey: ["batches"] }); setEditor(null); toast.success("Batch saved"); },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteBatch,
    onSuccess: () => { client.invalidateQueries({ queryKey: ["batches"] }); toast.success("Batch deleted"); },
    onError: (error) => toast.error(error.message.includes("foreign key") ? "This batch is in use and cannot be deleted." : error.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    save.mutate({
      id: editor === "new" ? undefined : editor?.id,
      name: String(form.get("name")),
      course_id: String(form.get("courseId")),
      timing: String(form.get("timing")),
      start_date: String(form.get("startDate")),
      end_date: String(form.get("endDate")) || null,
      is_active: form.get("active") === "on",
    });
  }
  const current = editor === "new" ? null : editor;
  return <>
    <PageHeader
      title={canManage ? "Batches" : "My classes"}
      description={canManage ? "Organize course groups, dates, timings, and availability." : "View the classes assigned to you."}
      actions={canManage ? <Button onClick={() => setEditor("new")}><Plus /> Add batch</Button> : undefined}
    />
    <CatalogCards loading={query.isLoading} empty="No batches yet">
      {query.data?.map((batch) => <article className="class-card catalog-card" key={batch.id}>
        <div className="class-card__color" /><div><span>{batch.courses?.name}</span><h3>{batch.name}</h3><p>{batch.timing} | {batch.start_date}</p><small>{batch.is_active ? "Active" : "Inactive"}</small></div>
        {canManage && <div className="catalog-actions"><button onClick={() => setEditor(batch)}><Edit3 /></button><button onClick={() => confirm("Delete this batch?") && remove.mutate(batch.id)}><Trash2 /></button></div>}
      </article>)}
    </CatalogCards>
    <Modal open={canManage && Boolean(editor)} onClose={() => setEditor(null)} title={current ? "Edit batch" : "Add batch"}>
      <form className="form" onSubmit={submit} key={current?.id ?? "new"}>
        <label>Name<input name="name" defaultValue={current?.name} required /></label>
        <label>Course<select name="courseId" defaultValue={current?.course_id} required>{courses.data?.map((course) => <option value={course.id} key={course.id}>{course.name}</option>)}</select></label>
        <label>Timing<input name="timing" defaultValue={current?.timing} placeholder="09:00-11:00" required /></label>
        <label>Start date<input name="startDate" type="date" defaultValue={current?.start_date} required /></label>
        <label>End date<input name="endDate" type="date" defaultValue={current?.end_date ?? ""} /></label>
        <label className="checkbox-line"><input name="active" type="checkbox" defaultChecked={current?.is_active ?? true} /> Active batch</label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button disabled={save.isPending}>Save batch</Button></div>
      </form>
    </Modal>
  </>;
}

export function TeachersDirectoryPage() {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: ["teachers"], queryFn: getTeachers });
  const batches = useQuery({ queryKey: ["batches"], queryFn: getBatches });
  const create = useMutation({
    mutationFn: createTeacher,
    onSuccess: () => { client.invalidateQueries({ queryKey: ["teachers"] }); setOpen(false); toast.success("Teacher account created"); },
    onError: (error) => toast.error(error.message),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    create.mutate({
      fullName: String(form.get("fullName")), email: String(form.get("email")), password: String(form.get("password")),
      phone: String(form.get("phone")), employeeId: String(form.get("employeeId")), specialization: String(form.get("specialization")),
      joiningDate: String(form.get("joiningDate")), batchIds: form.getAll("batchIds").map(String),
    });
  }
  return <>
    <PageHeader title="Teachers" description="Create teacher accounts and assign their classes." actions={<Button onClick={() => setOpen(true)}><Plus /> Add teacher</Button>} />
    <section className="people-grid">{query.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : query.data?.map((teacher) => <article className="person-card" key={teacher.id}><div className="avatar avatar--large">{teacher.profiles?.full_name.slice(0, 2).toUpperCase()}</div><h3>{teacher.profiles?.full_name}</h3><p>{teacher.specialization || "Teacher"}</p><span>{teacher.employee_id}</span></article>)}</section>
    {!query.isLoading && !query.data?.length && <div className="panel empty-state"><h3>No teachers yet</h3><p>Create the first teacher account and assign a batch.</p></div>}
    <Modal open={open} onClose={() => setOpen(false)} title="Create teacher account">
      <form className="form" onSubmit={submit}>
        <label>Full name<input name="fullName" required /></label><label>Email<input name="email" type="email" required /></label>
        <label>Temporary password<input name="password" type="password" minLength={8} required /></label><label>Phone<input name="phone" /></label>
        <label>Employee ID<input name="employeeId" required /></label><label>Specialization<input name="specialization" /></label>
        <label>Joining date<input name="joiningDate" type="date" required /></label>
        <label>Assigned batches<select name="batchIds" multiple size={Math.min(5, Math.max(2, batches.data?.length ?? 2))}>{batches.data?.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button><Button disabled={create.isPending}>{create.isPending && <LoaderCircle className="spin" />} Create teacher</Button></div>
      </form>
    </Modal>
  </>;
}

function CatalogCards({ children, loading, empty }: { children: React.ReactNode; loading: boolean; empty: string }) {
  if (loading) return <div className="route-loader"><LoaderCircle className="spin" /></div>;
  return <section className="class-grid">{children || <div className="panel empty-state"><h3>{empty}</h3></div>}</section>;
}

