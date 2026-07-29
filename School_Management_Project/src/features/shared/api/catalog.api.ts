import { supabase } from "@/lib/supabase";
import type { Batch, Course, Profile, TeacherRecord } from "@/types/database.types";

export async function getCourses() {
  const { data, error } = await supabase.from("courses").select("*").order("name");
  if (error) throw error; return data as Course[];
}
export async function saveCourse(input: Partial<Course>) {
  const { data, error } = input.id
    ? await supabase.from("courses").update(input).eq("id", input.id).select().single()
    : await supabase.from("courses").insert(input).select().single();
  if (error) throw error; return data;
}
export async function getBatches() {
  const { data, error } = await supabase.from("batches").select("*, courses(name,code)").order("start_date", { ascending: false });
  if (error) throw error; return data as unknown as Batch[];
}
export async function getBatchesForTeacher(profileId: string) {
  const { data: teacher, error: teacherError } = await supabase
    .from("teachers")
    .select("teacher_batches(batch_id)")
    .eq("profile_id", profileId)
    .maybeSingle();
  if (teacherError) throw teacherError;
  const batchIds = (teacher?.teacher_batches ?? []).map((item: { batch_id: string }) => item.batch_id);
  if (!batchIds.length) return [];
  const { data, error } = await supabase
    .from("batches")
    .select("*, courses(name,code)")
    .in("id", batchIds)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data as unknown as Batch[];
}
export async function saveBatch(input: Partial<Batch>) {
  const { data, error } = input.id
    ? await supabase.from("batches").update(input).eq("id", input.id).select().single()
    : await supabase.from("batches").insert(input).select().single();
  if (error) throw error; return data;
}
export async function getTeachers() {
  const { data, error } = await supabase.from("teachers").select("*, profiles(*)").order("created_at", { ascending: false });
  if (error) throw error; return data as unknown as TeacherRecord[];
}
export async function getProfiles() {
  const { data, error } = await supabase.from("profiles").select("*, profile_roles(roles(name))").order("created_at", { ascending: false });
  if (error) throw error; return data as unknown as Profile[];
}
