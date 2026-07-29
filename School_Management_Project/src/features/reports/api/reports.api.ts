import { supabase } from "@/lib/supabase";

export interface ReportFilters {
  batchId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getInstituteReport(filters: ReportFilters) {
  let attendanceQuery = supabase
    .from("attendance")
    .select("id,attendance_date,status,remarks,student_id,batch_id,students(application_id,profiles(full_name)),batches(name,courses(name))")
    .order("attendance_date", { ascending: false });
  let assignmentsQuery = supabase
    .from("assignments")
    .select("id,title,status,due_at,batch_id,batches(name),courses(name),assignment_submissions(count)")
    .order("due_at", { ascending: false });
  let studentsQuery = supabase
    .from("students")
    .select("id,application_id,enrollment_date,batch_id,profiles(full_name,email),courses(name),batches(name)");
  if (filters.batchId) {
    attendanceQuery = attendanceQuery.eq("batch_id", filters.batchId);
    assignmentsQuery = assignmentsQuery.eq("batch_id", filters.batchId);
    studentsQuery = studentsQuery.eq("batch_id", filters.batchId);
  }
  if (filters.dateFrom) attendanceQuery = attendanceQuery.gte("attendance_date", filters.dateFrom);
  if (filters.dateTo) attendanceQuery = attendanceQuery.lte("attendance_date", filters.dateTo);
  const [attendance, assignments, students] = await Promise.all([attendanceQuery, assignmentsQuery, studentsQuery]);
  const error = attendance.error ?? assignments.error ?? students.error;
  if (error) throw error;
  return {
    attendance: attendance.data ?? [],
    assignments: assignments.data ?? [],
    students: students.data ?? [],
  };
}
