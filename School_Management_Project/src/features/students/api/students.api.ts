import { supabase } from "@/lib/supabase";
import { getFunctionErrorMessage } from "@/lib/functionError";
import type { StudentRecord } from "@/types/database.types";

export interface StudentFilters { search?: string; courseId?: string; batchId?: string; page?: number; pageSize?: number; }

export async function getStudents(filters: StudentFilters = {}) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 10;
  let query = supabase
    .from("students")
    .select("*, profiles(*), courses(name,code), batches(name,timing)", { count: "exact" })
    .range((page - 1) * pageSize, page * pageSize - 1)
    .order("created_at", { ascending: false });
  if (filters.courseId) query = query.eq("course_id", filters.courseId);
  if (filters.batchId) query = query.eq("batch_id", filters.batchId);
  if (filters.search) query = query.or(`application_id.ilike.%${filters.search}%,father_name.ilike.%${filters.search}%`);
  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data as unknown as StudentRecord[], count: count ?? 0 };
}

export async function getStudent(id: string) {
  const { data, error } = await supabase.from("students").select("*, profiles(*), courses(name,code), batches(name,timing)").eq("id", id).single();
  if (error) throw error;
  return data as unknown as StudentRecord;
}

export async function createStudent(input: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("create-user", { body: { ...input, role: "student" } });
  if (error) {
    const message = await getFunctionErrorMessage(error);
    const unavailable = message.toLowerCase().includes("failed to send");
    throw new Error(unavailable
      ? "Account service is not deployed. Deploy the create-user Supabase Edge Function and try again."
      : message);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase.from("students").delete().eq("id", id);
  if (error) throw error;
}

