import { supabase } from "@/lib/supabase";

export async function updateTeacher(input: {
  id: string; profileId: string; fullName: string; phone?: string; employeeId: string;
  specialization?: string; joiningDate: string; batchIds: string[];
}) {
  const { error: profileError } = await supabase.from("profiles").update({ full_name: input.fullName, phone: input.phone || null }).eq("id", input.profileId);
  if (profileError) throw profileError;
  const { error: teacherError } = await supabase.from("teachers").update({
    employee_id: input.employeeId, specialization: input.specialization || null, joining_date: input.joiningDate,
  }).eq("id", input.id);
  if (teacherError) throw teacherError;
  const { error: clearError } = await supabase.from("teacher_batches").delete().eq("teacher_id", input.id);
  if (clearError) throw clearError;
  if (input.batchIds.length) {
    const { error } = await supabase.from("teacher_batches").insert(input.batchIds.map((batchId) => ({ teacher_id: input.id, batch_id: batchId })));
    if (error) throw error;
  }
}

export async function deleteTeacher(id: string) {
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) throw error;
}
