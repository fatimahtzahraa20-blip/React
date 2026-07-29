import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays, Download, Edit3, Eye, FileCheck2, FileUp, LoaderCircle, Plus, Search, Trash2,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getBatches, getBatchesForTeacher, getCourses } from "@/features/shared/api/catalog.api";
import { useAuthStore } from "@/store/authStore";
import type { AssignmentRecord, SubmissionStatus } from "@/types/database.types";
import {
  createAssignment, deleteAssignment, getAssignmentSubmissions, getAssignments, getCurrentStudent,
  getMySubmission, openAssignmentFile, reviewSubmission, submitAssignment, updateAssignment,
  type AssignmentInput, type SubmissionRecord,
} from "../api/assignments.api";

function assignmentInput(formElement: HTMLFormElement): AssignmentInput {
  const form = new FormData(formElement);
  const marks = String(form.get("maxMarks") ?? "");
  return {
    title: String(form.get("title")),
    description: String(form.get("description")),
    courseId: String(form.get("courseId")),
    batchId: String(form.get("batchId")),
    dueAt: new Date(String(form.get("dueAt"))).toISOString(),
    maxMarks: marks ? Number(marks) : undefined,
    status: form.get("status") as "draft" | "published" | "closed",
    files: (formElement.elements.namedItem("files") as HTMLInputElement).files ?? undefined,
  };
}

export function AssignmentsManagementPage() {
  const client = useQueryClient();
  const { user, roles } = useAuthStore();
  const isStudent = roles.includes("student");
  const isTeacher = roles.includes("teacher") && !roles.includes("admin") && !roles.includes("super_admin");
  const canManage = roles.some((role) => ["super_admin", "admin", "teacher"].includes(role));
  const [editor, setEditor] = useState<AssignmentRecord | "new" | null>(null);
  const [submissionFor, setSubmissionFor] = useState<AssignmentRecord | null>(null);
  const [reviewFor, setReviewFor] = useState<AssignmentRecord | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const assignments = useQuery({ queryKey: ["assignments"], queryFn: getAssignments });
  const courses = useQuery({ queryKey: ["courses"], queryFn: getCourses, enabled: canManage });
  const batches = useQuery({
    queryKey: ["batches", isTeacher ? user?.id : "all"],
    queryFn: () => isTeacher ? getBatchesForTeacher(user!.id) : getBatches(),
    enabled: canManage && Boolean(user?.id),
  });
  const student = useQuery({
    queryKey: ["current-student", user?.id],
    queryFn: () => getCurrentStudent(user!.id),
    enabled: Boolean(user?.id) && isStudent,
  });
  const mySubmission = useQuery({
    queryKey: ["my-submission", submissionFor?.id, student.data?.id],
    queryFn: () => getMySubmission(submissionFor!.id, student.data!.id),
    enabled: Boolean(submissionFor && student.data?.id),
  });
  const submissions = useQuery({
    queryKey: ["assignment-submissions", reviewFor?.id],
    queryFn: () => getAssignmentSubmissions(reviewFor!.id),
    enabled: Boolean(reviewFor),
  });

  const save = useMutation({
    mutationFn: ({ input, id }: { input: AssignmentInput; id?: string }) =>
      id ? updateAssignment(id, input) : createAssignment(input, user!.id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["assignments"] });
      client.invalidateQueries({ queryKey: ["dashboard"] });
      setEditor(null);
      toast.success("Assignment saved");
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment deleted");
    },
    onError: (error) => toast.error(error.message),
  });
  const submit = useMutation({
    mutationFn: ({ remarks, files }: { remarks: string; files: FileList | File[] }) =>
      submitAssignment(submissionFor!.id, student.data!.id, user!.id, remarks, files),
    onSuccess: ({ isLate }) => {
      client.invalidateQueries({ queryKey: ["assignments"] });
      client.invalidateQueries({ queryKey: ["my-submission"] });
      setSubmissionFor(null);
      toast.success(isLate ? "Assignment submitted and marked late" : "Assignment submitted");
    },
    onError: (error) => toast.error(error.message),
  });

  const filtered = useMemo(() => (assignments.data ?? []).filter((assignment) => {
    const matchesSearch = `${assignment.title} ${assignment.courses?.name ?? ""} ${assignment.batches?.name ?? ""}`
      .toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "all" || assignment.status === status);
  }), [assignments.data, search, status]);

  function saveAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save.mutate({ input: assignmentInput(event.currentTarget), id: editor === "new" ? undefined : editor?.id });
  }
  function submitWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const files = (event.currentTarget.elements.namedItem("files") as HTMLInputElement).files ?? [];
    submit.mutate({ remarks: String(form.get("remarks")), files });
  }

  return <>
    <PageHeader
      title="Assignments"
      description={canManage ? "Create, publish, edit and review student assignments." : "Review assignments, download files and submit your work."}
      actions={canManage ? <Button onClick={() => setEditor("new")}><Plus /> New assignment</Button> : undefined}
    />
    <section className="panel table-toolbar assignment-toolbar">
      <label className="table-search"><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search assignments" /></label>
      <select value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="all">All statuses</option><option value="published">Published</option><option value="draft">Draft</option><option value="closed">Closed</option>
      </select>
    </section>
    {isStudent && !student.isLoading && !student.data && (
      <div className="panel empty-state">
        <FileCheck2 />
        <h3>Enrollment setup required</h3>
        <p>Your login has the Student role, but it is not linked to a student enrollment. Ask an administrator to add your course and batch before submitting work.</p>
      </div>
    )}
    {assignments.isLoading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : assignments.error ? (
      <div className="panel empty-state"><h3>Could not load assignments</h3><p>{assignments.error.message}</p></div>
    ) : <section className="assignment-cards">{filtered.map((item) => {
      const late = new Date(item.due_at) < new Date();
      const submissionCount = item.assignment_submissions?.[0]?.count ?? 0;
      return <article className="assignment-card" key={item.id}>
        <div className="assignment-card__icon"><FileUp /></div>
        <span className={`badge badge--${item.status}`}>{item.status}</span>
        <h3>{item.title}</h3><p>{item.courses?.name} | {item.batches?.name}</p>
        <div className="assignment-description">{item.description}</div>
        <div className="assignment-files">
          {item.assignment_files?.map((file) => <button key={file.id} onClick={() => openAssignmentFile(file, "assignment-files")}><Download />{file.file_name}</button>)}
        </div>
        <div className={`assignment-card__due ${late ? "is-late" : ""}`}><CalendarDays /> {new Date(item.due_at).toLocaleString()} {late && "- Past due"}</div>
        <footer>
          <span>{submissionCount} submission{submissionCount === 1 ? "" : "s"}</span>
          {canManage ? <div className="assignment-actions">
            <button title="Review submissions" onClick={() => setReviewFor(item)}><Eye /></button>
            <button title="Edit assignment" onClick={() => setEditor(item)}><Edit3 /></button>
            <button title="Delete assignment" onClick={() => confirm("Delete this assignment and its files?") && remove.mutate(item.id)}><Trash2 /></button>
          </div> : isStudent ? <Button size="sm" onClick={() => setSubmissionFor(item)} disabled={item.status !== "published" || !student.data}>
            {item.status === "published" ? "Submit work" : "Submissions closed"}
          </Button> : null}
        </footer>
      </article>;
    })}</section>}
    {!assignments.isLoading && !filtered.length && <div className="panel empty-state"><FileCheck2 /><h3>No matching assignments</h3><p>Try changing your search or status filter.</p></div>}

    <AssignmentEditor
      assignment={editor}
      courses={courses.data ?? []}
      batches={batches.data ?? []}
      saving={save.isPending}
      onClose={() => setEditor(null)}
      onSubmit={saveAssignment}
    />
    <Modal open={Boolean(submissionFor)} onClose={() => setSubmissionFor(null)} title="Submit assignment" description="PDF and image files up to 15 MB are accepted.">
      {mySubmission.data && <div className="submission-notice">Previously submitted {new Date(mySubmission.data.submitted_at).toLocaleString()} | {mySubmission.data.status}</div>}
      <form className="form" onSubmit={submitWork}>
        <label className="form__wide">Remarks<textarea name="remarks" rows={4} defaultValue={mySubmission.data?.remarks ?? ""} /></label>
        <label className="form__wide">Files<input name="files" type="file" multiple required={!mySubmission.data} accept=".pdf,image/jpeg,image/png,image/webp" /></label>
        <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={() => setSubmissionFor(null)}>Cancel</Button><Button disabled={submit.isPending}>{submit.isPending && <LoaderCircle className="spin" />} Submit work</Button></div>
      </form>
    </Modal>
    <ReviewModal assignment={reviewFor} submissions={submissions.data ?? []} loading={submissions.isLoading} onClose={() => setReviewFor(null)} />
  </>;
}

function AssignmentEditor({
  assignment, courses, batches, saving, onClose, onSubmit,
}: {
  assignment: AssignmentRecord | "new" | null;
  courses: { id: string; name: string }[];
  batches: { id: string; name: string; course_id: string }[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const current = assignment === "new" ? null : assignment;
  const localDue = current ? new Date(new Date(current.due_at).getTime() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16) : "";
  return <Modal open={Boolean(assignment)} onClose={onClose} title={current ? "Edit assignment" : "Create assignment"} description="Publish immediately or save a draft.">
    <form className="form" onSubmit={onSubmit} key={current?.id ?? "new"}>
      <label className="form__wide">Title<input name="title" defaultValue={current?.title} required /></label>
      <label className="form__wide">Description<textarea name="description" rows={4} defaultValue={current?.description} required /></label>
      <label>Course<select name="courseId" defaultValue={current?.course_id} required>{courses.map((course) => <option value={course.id} key={course.id}>{course.name}</option>)}</select></label>
      <label>Batch<select name="batchId" defaultValue={current?.batch_id} required>{batches.map((batch) => <option value={batch.id} key={batch.id}>{batch.name}</option>)}</select></label>
      <label>Due date<input name="dueAt" type="datetime-local" defaultValue={localDue} required /></label>
      <label>Maximum marks<input name="maxMarks" type="number" min="0" defaultValue={current?.max_marks ?? ""} /></label>
      <label>Status<select name="status" defaultValue={current?.status ?? "published"}><option value="published">Published</option><option value="draft">Draft</option><option value="closed">Closed</option></select></label>
      <label>New attachments<input name="files" type="file" multiple accept=".pdf,image/jpeg,image/png,image/webp" /></label>
      <div className="form__actions form__wide"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button disabled={saving}>{saving && <LoaderCircle className="spin" />} Save assignment</Button></div>
    </form>
  </Modal>;
}

function ReviewModal({ assignment, submissions, loading, onClose }: {
  assignment: AssignmentRecord | null; submissions: SubmissionRecord[]; loading: boolean; onClose: () => void;
}) {
  const client = useQueryClient();
  const review = useMutation({
    mutationFn: reviewSubmission,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["assignment-submissions", assignment?.id] });
      toast.success("Submission reviewed");
    },
    onError: (error) => toast.error(error.message),
  });
  function saveReview(event: FormEvent<HTMLFormElement>, submission: SubmissionRecord) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const marks = String(form.get("marks") ?? "");
    review.mutate({
      id: submission.id,
      status: form.get("status") as SubmissionStatus,
      marks: marks ? Number(marks) : undefined,
      feedback: String(form.get("feedback") ?? ""),
    });
  }
  return <Modal open={Boolean(assignment)} onClose={onClose} title={`Submissions | ${assignment?.title ?? ""}`} description="Download work, award marks, and return feedback.">
    {loading ? <div className="route-loader"><LoaderCircle className="spin" /></div> : submissions.length ? <div className="review-list">
      {submissions.map((submission) => <form key={submission.id} onSubmit={(event) => saveReview(event, submission)} className="review-card">
        <header><div><strong>{submission.students?.profiles?.full_name ?? "Student"}</strong><small>{submission.students?.application_id} | {new Date(submission.submitted_at).toLocaleString()}</small></div><span className={`badge badge--${submission.status}`}>{submission.status}</span></header>
        {submission.remarks && <p>{submission.remarks}</p>}
        <div className="assignment-files">{submission.submission_files?.map((file) => <button type="button" key={file.id} onClick={() => openAssignmentFile(file, "submission-files")}><Download />{file.file_name}</button>)}</div>
        <div className="review-fields"><label>Marks<input name="marks" type="number" min="0" max={assignment?.max_marks ?? undefined} defaultValue={submission.marks ?? ""} /></label><label>Status<select name="status" defaultValue={submission.status}><option value="reviewed">Reviewed</option><option value="returned">Returned</option><option value="submitted">Submitted</option></select></label></div>
        <label>Feedback<textarea name="feedback" rows={2} defaultValue={submission.feedback ?? ""} /></label>
        <Button size="sm" disabled={review.isPending}>Save review</Button>
      </form>)}
    </div> : <div className="empty-state"><FileCheck2 /><h3>No submissions yet</h3><p>Student work will appear here after submission.</p></div>}
  </Modal>;
}


