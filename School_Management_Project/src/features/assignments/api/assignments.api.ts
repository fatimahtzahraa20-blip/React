import { supabase } from "@/lib/supabase";
import { getSignedFileUrl, uploadFile } from "@/services/storage.service";
import type { AssignmentFile, AssignmentRecord, AssignmentStatus, SubmissionStatus } from "@/types/database.types";

export interface AssignmentInput {
  title: string;
  description: string;
  courseId: string;
  batchId: string;
  dueAt: string;
  maxMarks?: number;
  status: AssignmentStatus;
  files?: FileList | File[];
}

export interface SubmissionRecord {
  id: string;
  assignment_id: string;
  student_id: string;
  remarks: string | null;
  status: SubmissionStatus;
  marks: number | null;
  feedback: string | null;
  submitted_at: string;
  students?: {
    application_id: string;
    profiles: { full_name: string; email: string } | null;
  } | null;
  submission_files?: AssignmentFile[];
}

export async function getAssignments() {
  const { data, error } = await supabase
    .from("assignments")
    .select("*, courses(name,code), batches(name), assignment_files(*), assignment_submissions(count)")
    .order("due_at", { ascending: true });
  if (error) throw error;
  return data as unknown as AssignmentRecord[];
}

async function uploadAssignmentFiles(assignmentId: string, files?: FileList | File[]) {
  for (const file of Array.from(files ?? [])) {
    const uploaded = await uploadFile("assignment-files", assignmentId, file);
    const { error } = await supabase.from("assignment_files").insert({
      assignment_id: assignmentId,
      storage_path: uploaded.path,
      file_name: uploaded.name,
      mime_type: uploaded.type,
      size_bytes: uploaded.size,
    });
    if (error) throw error;
  }
}

export async function createAssignment(input: AssignmentInput, userId: string) {
  const { data, error } = await supabase.from("assignments").insert({
    title: input.title,
    description: input.description,
    course_id: input.courseId,
    batch_id: input.batchId,
    due_at: input.dueAt,
    max_marks: input.maxMarks,
    status: input.status,
    created_by: userId,
  }).select().single();
  if (error) throw error;
  await uploadAssignmentFiles(data.id, input.files);
  return data;
}

export async function updateAssignment(id: string, input: AssignmentInput) {
  const { data, error } = await supabase.from("assignments").update({
    title: input.title,
    description: input.description,
    course_id: input.courseId,
    batch_id: input.batchId,
    due_at: input.dueAt,
    max_marks: input.maxMarks,
    status: input.status,
  }).eq("id", id).select().single();
  if (error) throw error;
  await uploadAssignmentFiles(id, input.files);
  return data;
}

export async function deleteAssignment(id: string) {
  const { data: files } = await supabase.from("assignment_files").select("storage_path").eq("assignment_id", id);
  if (files?.length) {
    const { error: storageError } = await supabase.storage.from("assignment-files").remove(files.map((file) => file.storage_path));
    if (storageError) throw storageError;
  }
  const { error } = await supabase.from("assignments").delete().eq("id", id);
  if (error) throw error;
}

export async function getCurrentStudent(profileId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("id,course_id,batch_id")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMySubmission(assignmentId: string, studentId: string) {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*, submission_files(*)")
    .eq("assignment_id", assignmentId)
    .eq("student_id", studentId)
    .maybeSingle();
  if (error) throw error;
  return data as unknown as SubmissionRecord | null;
}

export async function submitAssignment(assignmentId: string, studentId: string, ownerProfileId: string, remarks: string, files: FileList | File[]) {
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("batch_id,due_at,status")
    .eq("id", assignmentId)
    .single();
  if (assignmentError) throw assignmentError;
  if (assignment.status !== "published") throw new Error("This assignment is not accepting submissions.");

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("batch_id")
    .eq("id", studentId)
    .eq("profile_id", ownerProfileId)
    .maybeSingle();
  if (studentError) throw studentError;
  if (!student) throw new Error("Your account is not linked to a student record. Ask an administrator to complete your enrollment.");
  if (student.batch_id !== assignment.batch_id) throw new Error("This assignment is not assigned to your batch.");

  const { data, error } = await supabase.from("assignment_submissions").upsert({
    assignment_id: assignmentId,
    student_id: studentId,
    remarks,
    status: "submitted",
    submitted_at: new Date().toISOString(),
    reviewed_at: null,
  }, { onConflict: "assignment_id,student_id" }).select().single();
  if (error) throw error;

  for (const file of Array.from(files)) {
    const uploaded = await uploadFile("submission-files", ownerProfileId, file);
    const { error: fileError } = await supabase.from("submission_files").insert({
      submission_id: data.id,
      storage_path: uploaded.path,
      file_name: uploaded.name,
      mime_type: uploaded.type,
      size_bytes: uploaded.size,
    });
    if (fileError) throw fileError;
  }
  return { ...data, isLate: new Date(data.submitted_at) > new Date(assignment.due_at) };
}

export async function getAssignmentSubmissions(assignmentId: string) {
  const { data, error } = await supabase
    .from("assignment_submissions")
    .select("*, students(application_id,profiles(full_name,email)), submission_files(*)")
    .eq("assignment_id", assignmentId)
    .order("submitted_at", { ascending: false });
  if (error) throw error;
  return data as unknown as SubmissionRecord[];
}

export async function reviewSubmission(input: {
  id: string;
  status: SubmissionStatus;
  marks?: number;
  feedback?: string;
}) {
  const { data, error } = await supabase.from("assignment_submissions").update({
    status: input.status,
    marks: input.marks ?? null,
    feedback: input.feedback || null,
    reviewed_at: new Date().toISOString(),
  }).eq("id", input.id).select().single();
  if (error) throw error;
  return data;
}

export async function openAssignmentFile(file: Pick<AssignmentFile, "storage_path">, bucket: "assignment-files" | "submission-files") {
  const url = await getSignedFileUrl(bucket, file.storage_path);
  window.open(url, "_blank", "noopener,noreferrer");
}

