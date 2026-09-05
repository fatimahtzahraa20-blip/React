import { supabase } from "@/lib/supabase";
import { getFunctionErrorMessage } from "@/lib/functionError";

export async function deleteCourse(id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteBatch(id: string) {
  const { error } = await supabase.from("batches").delete().eq("id", id);
  if (error) throw error;
}

export async function createTeacher(input: {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  employeeId: string;
  specialization?: string;
  joiningDate: string;
  batchIds: string[];
}) {
  const { data, error } = await supabase.functions.invoke("create-user", {
    body: { ...input, role: "teacher" },
  });
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

