import { supabase } from "@/lib/supabase";

export async function getNotifications({ limit = 30, unreadOnly = false } = {}) {
  const { data, error } = await supabase.rpc("get_my_notifications", {
    p_limit: limit,
    p_unread_only: unreadOnly,
  });
  if (error) throw error;
  return data || [];
}

export async function refreshSystemAlerts() {
  const { error } = await supabase.rpc("refresh_system_alerts");
  if (error) throw error;
}

export async function markNotificationRead(id) {
  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: id,
  });
  if (error) throw error;
  return id;
}

export async function markAllNotificationsRead() {
  const { error } = await supabase.rpc("mark_all_notifications_read");
  if (error) throw error;
}

export async function getSystemLogs({ limit = 100 } = {}) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,user_id,action,module,entity_type,entity_id,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
