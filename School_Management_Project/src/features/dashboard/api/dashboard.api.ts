import { supabase } from "@/lib/supabase";
import type { AppRole, AttendanceStatus } from "@/types/database.types";

export interface DashboardAssignment {
  id: string;
  title: string;
  due_at: string;
  status: "draft" | "published" | "closed";
  courses: { name: string; code: string } | null;
  batches: { name: string } | null;
  assignment_submissions?: { count: number }[];
}

export interface DashboardActivity {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
}

export interface DashboardData {
  students: number;
  teachers: number;
  classes: number;
  assignments: number;
  submissions: number;
  pendingAssignments: number;
  attendance: Record<AttendanceStatus, number>;
  recentAssignments: DashboardAssignment[];
  recentActivity: DashboardActivity[];
  unreadNotifications: number;
}

const emptyAttendance: Record<AttendanceStatus, number> = {
  present: 0,
  absent: 0,
  late: 0,
  leave: 0,
};

function ensureNoError(error: { message: string } | null) {
  if (error) throw error;
}

async function getAdminDashboard(): Promise<DashboardData> {
  const today = new Date().toISOString().slice(0, 10);
  const [students, teachers, classes, assignments, submissions, attendance, recentAssignments, activity] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("teachers").select("*", { count: "exact", head: true }),
      supabase.from("batches").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("assignments").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("assignment_submissions").select("*", { count: "exact", head: true }),
      supabase.from("attendance").select("status").eq("attendance_date", today),
      supabase
        .from("assignments")
        .select("id,title,due_at,status,courses(name,code),batches(name),assignment_submissions(count)")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("activity_logs").select("id,action,entity_type,created_at").order("created_at", { ascending: false }).limit(6),
    ]);

  [students, teachers, classes, assignments, submissions, attendance, recentAssignments, activity].forEach(({ error }) =>
    ensureNoError(error),
  );

  const attendanceSummary = { ...emptyAttendance };
  attendance.data?.forEach(({ status }) => {
    attendanceSummary[status as AttendanceStatus] += 1;
  });

  return {
    students: students.count ?? 0,
    teachers: teachers.count ?? 0,
    classes: classes.count ?? 0,
    assignments: assignments.count ?? 0,
    submissions: submissions.count ?? 0,
    pendingAssignments: Math.max((assignments.count ?? 0) - (submissions.count ?? 0), 0),
    attendance: attendanceSummary,
    recentAssignments: (recentAssignments.data ?? []) as unknown as DashboardAssignment[],
    recentActivity: (activity.data ?? []) as DashboardActivity[],
    unreadNotifications: 0,
  };
}

async function getTeacherDashboard(userId: string): Promise<DashboardData> {
  const today = new Date().toISOString().slice(0, 10);
  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("id,teacher_batches(batch_id)")
    .eq("profile_id", userId)
    .maybeSingle();
  ensureNoError(teacherError);

  const batchIds = (teacher?.teacher_batches ?? []).map((item: { batch_id: string }) => item.batch_id);
  const noClasses = batchIds.length === 0;
  const [students, assignments, submissions, attendance, recentAssignments, notifications] = await Promise.all([
    noClasses
      ? Promise.resolve({ count: 0, error: null })
      : supabase.from("students").select("*", { count: "exact", head: true }).in("batch_id", batchIds),
    supabase.from("assignments").select("*", { count: "exact", head: true }).eq("created_by", userId),
    supabase
      .from("assignment_submissions")
      .select("*,assignments!inner(created_by)", { count: "exact", head: true })
      .eq("assignments.created_by", userId),
    noClasses
      ? Promise.resolve({ data: [], error: null })
      : supabase.from("attendance").select("status").in("batch_id", batchIds).eq("attendance_date", today),
    supabase
      .from("assignments")
      .select("id,title,due_at,status,courses(name,code),batches(name),assignment_submissions(count)")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null),
  ]);

  [students, assignments, submissions, attendance, recentAssignments, notifications].forEach(({ error }) => ensureNoError(error));
  const attendanceSummary = { ...emptyAttendance };
  attendance.data?.forEach(({ status }: { status: AttendanceStatus }) => {
    attendanceSummary[status] += 1;
  });

  return {
    students: students.count ?? 0,
    teachers: 0,
    classes: batchIds.length,
    assignments: assignments.count ?? 0,
    submissions: submissions.count ?? 0,
    pendingAssignments: Math.max((assignments.count ?? 0) - (submissions.count ?? 0), 0),
    attendance: attendanceSummary,
    recentAssignments: (recentAssignments.data ?? []) as unknown as DashboardAssignment[],
    recentActivity: [],
    unreadNotifications: notifications.count ?? 0,
  };
}

async function getStudentDashboard(userId: string): Promise<DashboardData> {
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id,batch_id")
    .eq("profile_id", userId)
    .maybeSingle();
  ensureNoError(studentError);

  if (!student) return getNotificationOnlyDashboard(userId);

  const [attendance, assignments, submissions, recentAssignments, notifications] = await Promise.all([
    supabase.from("attendance").select("status").eq("student_id", student.id),
    supabase.from("assignments").select("*", { count: "exact", head: true }).eq("batch_id", student.batch_id).eq("status", "published"),
    supabase.from("assignment_submissions").select("*", { count: "exact", head: true }).eq("student_id", student.id),
    supabase
      .from("assignments")
      .select("id,title,due_at,status,courses(name,code),batches(name),assignment_submissions(count)")
      .eq("batch_id", student.batch_id)
      .eq("status", "published")
      .order("due_at", { ascending: true })
      .limit(5),
    supabase.from("notifications").select("*", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null),
  ]);
  [attendance, assignments, submissions, recentAssignments, notifications].forEach(({ error }) => ensureNoError(error));

  const attendanceSummary = { ...emptyAttendance };
  attendance.data?.forEach(({ status }) => {
    attendanceSummary[status as AttendanceStatus] += 1;
  });

  return {
    students: 0,
    teachers: 0,
    classes: 1,
    assignments: assignments.count ?? 0,
    submissions: submissions.count ?? 0,
    pendingAssignments: Math.max((assignments.count ?? 0) - (submissions.count ?? 0), 0),
    attendance: attendanceSummary,
    recentAssignments: (recentAssignments.data ?? []) as unknown as DashboardAssignment[],
    recentActivity: [],
    unreadNotifications: notifications.count ?? 0,
  };
}

async function getNotificationOnlyDashboard(userId: string): Promise<DashboardData> {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);
  ensureNoError(error);
  return {
    students: 0,
    teachers: 0,
    classes: 0,
    assignments: 0,
    submissions: 0,
    pendingAssignments: 0,
    attendance: { ...emptyAttendance },
    recentAssignments: [],
    recentActivity: [],
    unreadNotifications: count ?? 0,
  };
}

export function getDashboardData(role: AppRole, userId: string) {
  if (role === "student") return getStudentDashboard(userId);
  if (role === "teacher") return getTeacherDashboard(userId);
  return getAdminDashboard();
}
