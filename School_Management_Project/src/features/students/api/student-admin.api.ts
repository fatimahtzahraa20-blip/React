import { supabase } from "@/lib/supabase";

export async function updateStudent(input: {
  id: string;
  profileId: string;
  fullName: string;
  fatherName: string;
  phone?: string;
  address?: string;
  applicationId: string;
  courseId: string;
  batchId: string;
  enrollmentDate: string;
}) {
  const { error: profileError } = await supabase.from("profiles").update({
    full_name: input.fullName,
    phone: input.phone || null,
  }).eq("id", input.profileId);
  if (profileError) throw profileError;
  const { data, error } = await supabase.from("students").update({
    father_name: input.fatherName,
    address: input.address || null,
    application_id: input.applicationId,
    course_id: input.courseId,
    batch_id: input.batchId,
    enrollment_date: input.enrollmentDate,
  }).eq("id", input.id).select().single();
  if (error) throw error;
  return data;
}
