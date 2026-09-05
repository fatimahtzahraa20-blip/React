import { supabase } from "@/lib/supabase";
import type { AttendanceRecord } from "@/types/database.types";

export async function getAttendance(batchId: string, date: string) {
  const { data, error } = await supabase.from("attendance").select("*").eq("batch_id", batchId).eq("attendance_date", date);
  if (error) throw error;
  return data as AttendanceRecord[];
}

export async function saveAttendance(records: AttendanceRecord[]) {
  const { data, error } = await supabase.from("attendance").upsert(records, { onConflict: "student_id,attendance_date" }).select();
  if (error) throw error;
  return data;
}

export async function getAttendanceReport(studentId?: string) {
  let query = supabase.from("attendance").select("*, students(application_id,profiles(full_name)), batches(name)").order("attendance_date", { ascending: false });
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}
