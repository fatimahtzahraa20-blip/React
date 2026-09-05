export type AppRole = "super_admin" | "admin" | "teacher" | "student";
export type AssignmentStatus = "draft" | "published" | "closed";
export type SubmissionStatus = "submitted" | "reviewed" | "returned";
export type AttendanceStatus = "present" | "absent" | "late" | "leave";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string; name: string; code: string; description: string | null;
  duration_months: number | null; is_active: boolean;
}

export interface Batch {
  id: string; course_id: string; name: string; timing: string;
  start_date: string; end_date: string | null; is_active: boolean;
  courses?: Pick<Course, "name" | "code">;
}

export interface StudentRecord {
  id: string; profile_id: string; application_id: string; father_name: string;
  address: string | null; course_id: string; batch_id: string; enrollment_date: string;
  profiles?: Profile; courses?: Pick<Course, "name" | "code">; batches?: Pick<Batch, "name" | "timing">;
}

export interface TeacherRecord {
  id: string; profile_id: string; employee_id: string; specialization: string | null;
  joining_date: string; profiles?: Profile;
}

export interface AssignmentRecord {
  id: string; title: string; description: string; course_id: string; batch_id: string;
  created_by: string; due_at: string; status: AssignmentStatus; max_marks: number | null;
  created_at: string; courses?: Pick<Course, "name" | "code">; batches?: Pick<Batch, "name">;
  assignment_files?: AssignmentFile[]; assignment_submissions?: { count: number }[];
}

export interface AssignmentFile {
  id: string; assignment_id: string; storage_path: string; file_name: string;
  mime_type: string; size_bytes: number;
}

export interface AttendanceRecord {
  id?: string; student_id: string; batch_id: string; attendance_date: string;
  status: AttendanceStatus; marked_by: string; remarks?: string | null;
}

export interface InstituteSettings {
  id: number;
  institute_name: string;
  logo_url: string | null;
  updated_at: string;
}

export interface NotificationRecord {
  id: string; recipient_id: string; title: string; message: string;
  link: string | null; read_at: string | null; created_at: string;
}
