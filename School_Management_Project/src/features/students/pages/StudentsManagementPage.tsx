import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Edit3, LoaderCircle, Plus, Search, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getBatches, getCourses } from "@/features/shared/api/catalog.api";
import { updateStudent } from "@/features/students/api/student-admin.api";
import { createStudent, deleteStudent, getStudents } from "@/features/students/api/students.api";
import { initials } from "@/lib/utils";
import type { StudentRecord } from "@/types/database.types";

export function StudentsManagementPage() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<StudentRecord | "new" | null>(null);
  const students = useQuery({ queryKey: ["students", search, courseId, batchId, page], queryFn: () => getStudents({ search, courseId, batchId, page, pageSize: 10 }) });
  const courses = useQuery({ queryKey: ["courses"], queryFn: getCourses });
  const batches = useQuery({ queryKey: ["batches"], queryFn: getBatches });
  const refresh = () => client.invalidateQueries({ queryKey: ["students"] });
  const create = useMutation({ mutationFn: createStudent, onSuccess: () => { refresh(); setEditor(null); toast.success("Student account created"); }, onError: (error) => toast.error(error.message) });
  const update = useMutation({ mutationFn: updateStudent, onSuccess: () => { refresh(); setEditor(null); toast.success("Student updated"); }, onError: (error) => toast.error(error.message) });
  const remove = useMutation({ mutationFn: deleteStudent, onSuccess: () => { refresh(); toast.success("Student record removed"); }, onError: (error) => toast.error(error.message) });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (editor === "new") {
      create.mutate(Object.fromEntries(form.entries()));
    } else if (editor) {
      update.mutate({
        id: editor.id, profileId: editor.profile_id, fullName: String(form.get("fullName")), fatherName: String(form.get("fatherName")),
        phone: String(form.get("phone")), address: String(form.get("address")), applicationId: String(form.get("applicationId")),
        courseId: String(form.get("courseId")), batchId: String(form.get("batchId")), enrollmentDate: String(form.get("enrollmentDate")),
      });
    }
  }
  function exportCsv() {
    const rows = [["Application ID", "Name", "Email", "Father Name", "Phone", "Course", "Batch", "Enrollment"], ...(students.data?.data ?? []).map((student) => [
      student.application_id, student.profiles?.full_name ?? "", student.profiles?.email ?? "", student.father_name,
      student.profiles?.phone ?? "", student.courses?.name ?? "", student.batches?.name ?? "", student.enrollment_date,
    ])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n")], { type: "text/csv" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "students.csv"; anchor.click(); URL.revokeObjectURL(url);
  }
  const current = editor === "new" ? null : editor;
  return <>
    <PageHeader title="Students" description="Create, edit, filter, export, and manage enrolled students." actions={<><Button variant="secondary" onClick={exportCsv}><Download /> Export CSV</Button><Button onClick={() => setEditor("new")}><Plus /> Add student</Button></>} />
    <section className="panel table-panel">
      <div className="table-toolbar">
        <label className="table-search"><Search /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search application ID or father name" /></label>
        <div><select value={courseId} onChange={(event) => { setCourseId(event.target.value); setBatchId(""); setPage(1); }}><option value="">All courses</option>{courses.data?.map((course) => <option value={course.id} key={course.id}>{course.name}</option>)}</select>
        <select value={batchId} onChange={(event) => { setBatchId(event.target.value); setPage(1); }}><option value="">All batches</option>{batches.data?.filter((batch) => !courseId || batch.course_id === courseId).map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></div>
      </div>
      {students.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : students.error ? <div className="empty-state"><h3>Could not load students</h3><p>{students.error.message}</p></div> :
        <div className="production-table"><div className="production-row production-row--head"><span>Student</span><span>Application ID</span><span>Course</span><span>Batch</span><span>Enrollment</span><span /></div>{students.data?.data.map((student) =>
          <div className="production-row" key={student.id}><div className="student-cell"><div className="avatar">{initials(student.profiles?.full_name ?? "")}</div><div><strong>{student.profiles?.full_name}</strong><small>{student.profiles?.email}</small></div></div><span>{student.application_id}</span><span>{student.courses?.name}</span><span>{student.batches?.name}</span><span>{student.enrollment_date}</span><div className="row-actions"><button onClick={() => setEditor(student)} title="Edit student"><Edit3 /></button><button onClick={() => confirm("Delete this student record?") && remove.mutate(student.id)} title="Delete student"><Trash2 /></button></div></div>
        )}</div>}
      {!students.isLoading && !students.data?.data.length && <div className="empty-state"><h3>No student records</h3><p>Create a student or change the active filters.</p></div>}
      <footer className="table-footer"><span>{students.data?.count ?? 0} students</span><div><Button variant="secondary" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="secondary" disabled={page * 10 >= (students.data?.count ?? 0)} onClick={() => setPage((value) => value + 1)}>Next</Button></div></footer>
    </section>
    <Modal open={Boolean(editor)} onClose={() => setEditor(null)} title={current ? "Edit student" : "Create student account"} description={current ? "Update personal and enrollment details." : "Create a confirmed Auth account and student profile."}>
      <form className="form" onSubmit={submit} key={current?.id ?? "new"}>
        <label>Full name<input name="fullName" defaultValue={current?.profiles?.full_name} required /></label><label>Father name<input name="fatherName" defaultValue={current?.father_name} required /></label>
        {!current && <><label>Email<input name="email" type="email" required /></label><label>Temporary password<input name="password" type="password" minLength={8} required /></label></>}
        <label>Phone<input name="phone" defaultValue={current?.profiles?.phone ?? ""} /></label><label>Application ID<input name="applicationId" defaultValue={current?.application_id} required /></label>
        <label>Course<select name="courseId" defaultValue={current?.course_id} required>{courses.data?.map((course) => <option value={course.id} key={course.id}>{course.name}</option>)}</select></label>
        <label>Batch<select name="batchId" defaultValue={current?.batch_id} required>{batches.data?.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
        <label>Enrollment date<input name="enrollmentDate" type="date" defaultValue={current?.enrollment_date} required /></label><label>Address<input name="address" defaultValue={current?.address ?? ""} /></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setEditor(null)}>Cancel</Button><Button disabled={create.isPending || update.isPending}>{(create.isPending || update.isPending) && <LoaderCircle className="spin" />} {current ? "Save student" : "Create student"}</Button></div>
      </form>
    </Modal>
  </>;
}
