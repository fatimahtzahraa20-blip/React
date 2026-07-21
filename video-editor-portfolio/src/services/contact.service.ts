import { supabase } from "../lib/supabase";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function sendContactMessage(
  contact: CreateContactMessage
) {
  const payload = {
    name: contact.name.trim(),
    email: contact.email.trim(),
    subject: contact.subject?.trim() || null,
    message: contact.message.trim(),
    is_read: false,
  };

  const { data, error } = await supabase
    .from("contact_messages")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ContactMessage;
}

export async function getMessages() {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ContactMessage[];
}

export async function getMessageById(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ContactMessage;
}

export async function markAsRead(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      is_read: true,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ContactMessage;
}

export async function markAsUnread(id: string) {
  const { data, error } = await supabase
    .from("contact_messages")
    .update({
      is_read: false,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ContactMessage;
}

export async function deleteMessage(id: string) {
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function getUnreadMessagesCount() {
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", {
      head: true,
      count: "exact",
    })
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getTotalMessagesCount() {
  const { count, error } = await supabase
    .from("contact_messages")
    .select("*", {
      head: true,
      count: "exact",
    });

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

export async function getRecentMessages(limit = 5) {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", {
      ascending: false,
    })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ContactMessage[];
}