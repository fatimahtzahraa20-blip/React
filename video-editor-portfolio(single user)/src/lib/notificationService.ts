import supabase from "./supabase";

export type NotificationType =
  | "general"
  | "user_registered"
  | "user_approved"
  | "user_rejected"
  | "video_submitted"
  | "video_approved"
  | "video_rejected"
  | "message_received"
  | "system"
  | string;

type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
};

export async function createNotification({
  userId,
  title,
  message,
  type = "general",
}: CreateNotificationInput): Promise<boolean> {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id: userId,
      title: title.trim(),
      message: message.trim(),
      type,
      is_read: false,
    });

    if (error) {
      console.error("Notification creation failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected notification error:", error);
    return false;
  }
}

export async function notifyAdmins({
  title,
  message,
  type = "system",
}: Omit<CreateNotificationInput, "userId">): Promise<boolean> {
  try {
    const { data: admins, error: adminsError } = await supabase
      .from("profiles")
      .select("id")
      .eq("role", "admin")
      .eq("is_active", true);

    if (adminsError) {
      console.error("Admin lookup failed:", adminsError.message);
      return false;
    }

    if (!admins || admins.length === 0) {
      return true;
    }

    const notifications = admins.map((admin) => ({
      user_id: admin.id,
      title: title.trim(),
      message: message.trim(),
      type,
      is_read: false,
    }));

    const { error: insertError } = await supabase
      .from("notifications")
      .insert(notifications);

    if (insertError) {
      console.error("Admin notification creation failed:", insertError.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected admin notification error:", error);
    return false;
  }
}

export async function notifyUserRegistered(
  userId: string,
  email: string
): Promise<boolean> {
  return notifyAdmins({
    title: "New user registration",
    message: `${email} created a new account and is waiting for approval.`,
    type: "user_registered",
  });
}

export async function notifyUserApproval(
  userId: string,
  approved: boolean
): Promise<boolean> {
  return createNotification({
    userId,
    title: approved ? "Account approved" : "Account rejected",
    message: approved
      ? "Your account has been approved. You can now sign in and access your dashboard."
      : "Your account request was rejected by the administrator.",
    type: approved ? "user_approved" : "user_rejected",
  });
}

export async function notifyVideoSubmitted(
  ownerId: string,
  title: string,
  videoId: string | number
): Promise<boolean> {
  const adminNotification = await notifyAdmins({
    title: "New video submitted",
    message: `"${title}" was submitted and is waiting for review. Video ID: ${videoId}.`,
    type: "video_submitted",
  });

  const userNotification = await createNotification({
    userId: ownerId,
    title: "Video submitted",
    message: `"${title}" was submitted successfully and is waiting for administrator approval.`,
    type: "video_submitted",
  });

  return adminNotification && userNotification;
}

export async function notifyVideoDecision(
  ownerId: string,
  title: string,
  approved: boolean
): Promise<boolean> {
  return createNotification({
    userId: ownerId,
    title: approved ? "Video approved" : "Video rejected",
    message: approved
      ? `"${title}" has been approved and can now appear in the public portfolio.`
      : `"${title}" was rejected by the administrator. Please review and update it before submitting again.`,
    type: approved ? "video_approved" : "video_rejected",
  });
}

export async function notifyNewContactMessage(
  senderName: string,
  senderEmail: string
): Promise<boolean> {
  return notifyAdmins({
    title: "New contact message",
    message: `${senderName || senderEmail} submitted a new contact message.`,
    type: "message_received",
  });
}