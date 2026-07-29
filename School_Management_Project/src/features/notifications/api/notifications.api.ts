import { supabase } from "@/lib/supabase";
import type { NotificationRecord } from "@/types/database.types";

export async function getNotifications() {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data as NotificationRecord[];
}

export async function markNotificationRead(id: string) {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).is("read_at", null);
  if (error) throw error;
}

export async function getNotificationRecipients() {
  const { data, error } = await supabase.from("profiles").select("id,full_name,email,profile_roles(roles(name))").eq("is_active", true).order("full_name");
  if (error) throw error;
  return data;
}

export async function sendNotification(input: { recipientIds: string[]; title: string; message: string; link?: string }) {
  if (!input.recipientIds.length) throw new Error("Select at least one recipient.");
  const { error } = await supabase.from("notifications").insert(input.recipientIds.map((recipientId) => ({
    recipient_id: recipientId,
    title: input.title,
    message: input.message,
    link: input.link || null,
  })));
  if (error) throw error;
}
