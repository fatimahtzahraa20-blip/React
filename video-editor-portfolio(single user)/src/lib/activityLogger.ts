import supabase from "./supabase";

export type ActivityAction =
  | "login"
  | "logout"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "reject"
  | "upload"
  | "status_change"
  | "password_reset"
  | "profile_update"
  | string;

export type ActivityEntity =
  | "user"
  | "video"
  | "category"
  | "subcategory"
  | "message"
  | "profile"
  | "notification"
  | "settings"
  | "authentication"
  | string;

type LogActivityInput = {
  action: ActivityAction;
  entityType?: ActivityEntity;
  entityId?: string | number | null;
  details?: string | null;
  userId?: string | null;
};

export async function logActivity({
  action,
  entityType,
  entityId,
  details,
  userId,
}: LogActivityInput): Promise<boolean> {
  try {
    let currentUserId = userId ?? null;

    if (!currentUserId) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Activity user lookup failed:", userError.message);
        return false;
      }

      currentUserId = user?.id ?? null;
    }

    if (!currentUserId) {
      console.error("Activity log skipped because no authenticated user exists.");
      return false;
    }

    const { error } = await supabase.from("activity_logs").insert({
      user_id: currentUserId,
      action,
      entity_type: entityType ?? null,
      entity_id:
        entityId === undefined || entityId === null
          ? null
          : String(entityId),
      details: details?.trim() || null,
    });

    if (error) {
      console.error("Activity log insert failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected activity log error:", error);
    return false;
  }
}

export async function logLogin(userId?: string | null) {
  return logActivity({
    userId,
    action: "login",
    entityType: "authentication",
    details: "User signed in successfully.",
  });
}

export async function logLogout(userId?: string | null) {
  return logActivity({
    userId,
    action: "logout",
    entityType: "authentication",
    details: "User signed out.",
  });
}

export async function logVideoCreated(
  videoId: string | number,
  title?: string | null,
  userId?: string | null
) {
  return logActivity({
    userId,
    action: "create",
    entityType: "video",
    entityId: videoId,
    details: title
      ? `Video "${title}" was created.`
      : "A new video was created.",
  });
}

export async function logVideoUpdated(
  videoId: string | number,
  title?: string | null,
  userId?: string | null
) {
  return logActivity({
    userId,
    action: "update",
    entityType: "video",
    entityId: videoId,
    details: title
      ? `Video "${title}" was updated.`
      : "A video was updated.",
  });
}

export async function logVideoDeleted(
  videoId: string | number,
  title?: string | null,
  userId?: string | null
) {
  return logActivity({
    userId,
    action: "delete",
    entityType: "video",
    entityId: videoId,
    details: title
      ? `Video "${title}" was deleted.`
      : "A video was deleted.",
  });
}

export async function logUserApproval(
  targetUserId: string,
  email?: string | null,
  approved = true,
  userId?: string | null
) {
  return logActivity({
    userId,
    action: approved ? "approve" : "reject",
    entityType: "user",
    entityId: targetUserId,
    details: email
      ? `${email} was ${approved ? "approved" : "rejected"}.`
      : `A user was ${approved ? "approved" : "rejected"}.`,
  });
}

export async function logProfileUpdate(userId?: string | null) {
  return logActivity({
    userId,
    action: "profile_update",
    entityType: "profile",
    entityId: userId ?? null,
    details: "Profile information was updated.",
  });
}