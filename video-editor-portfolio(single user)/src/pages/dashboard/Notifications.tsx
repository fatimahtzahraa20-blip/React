import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import supabase from "../../lib/supabase";

type Notification = {
  id: string | number;
  user_id: string | null;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string | null;
};

const PAGE_SIZE = 8;

export default function Notifications() {
  const { user, profile } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = true;

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    let query = supabase
      .from("notifications")
      .select("id, user_id, title, message, type, is_read, created_at")
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error: notificationsError } = await query;

    if (notificationsError) {
      setError(notificationsError.message);
      setNotifications([]);
    } else {
      setNotifications((data ?? []) as Notification[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadNotifications();
  }, [user, isAdmin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const filteredNotifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesSearch =
        !normalizedSearch ||
        notification.title.toLowerCase().includes(normalizedSearch) ||
        notification.message.toLowerCase().includes(normalizedSearch) ||
        (notification.type ?? "").toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === "all" ||
        (filter === "read" && notification.is_read) ||
        (filter === "unread" && !notification.is_read);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredNotifications.length / PAGE_SIZE)
  );

  const visibleNotifications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredNotifications.slice(start, start + PAGE_SIZE);
  }, [filteredNotifications, currentPage]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const toggleRead = async (notification: Notification) => {
    setUpdatingId(notification.id);
    setMessage("");
    setError("");

    const nextValue = !notification.is_read;

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ is_read: nextValue })
      .eq("id", notification.id);

    setUpdatingId(null);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, is_read: nextValue }
          : item
      )
    );

    setMessage(
      nextValue
        ? "Notification marked as read."
        : "Notification marked as unread."
    );
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) {
      return;
    }

    setMessage("");
    setError("");

    let query = supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { error: updateError } = await query;

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );

    setMessage("All notifications marked as read.");
  };

  const deleteNotification = async (notification: Notification) => {
    const confirmed = window.confirm(
      `Delete notification "${notification.title}"?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(notification.id);
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notification.id);

    setUpdatingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setNotifications((current) =>
      current.filter((item) => item.id !== notification.id)
    );

    setMessage("Notification deleted successfully.");
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            {isAdmin ? "Admin Panel" : "Account"}
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notifications</h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                {isAdmin
                  ? "Review system notifications and recent platform activity."
                  : "View updates about your account and submitted videos."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void markAllAsRead()}
                disabled={unreadCount === 0}
                className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
              >
                Mark All Read
              </button>

              <button
                type="button"
                onClick={() => void loadNotifications()}
                disabled={loading}
                className="rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total
            </p>
            <p className="mt-2 text-3xl font-bold">{notifications.length}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("unread")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Unread
            </p>
            <p className="mt-2 text-3xl font-bold">{unreadCount}</p>
          </button>

          <button
            type="button"
            onClick={() => setFilter("read")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Read
            </p>
            <p className="mt-2 text-3xl font-bold">
              {notifications.length - unreadCount}
            </p>
          </button>
        </section>

        {message && (
          <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="grid gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 md:grid-cols-[minmax(0,1fr)_180px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search notifications..."
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as "all" | "unread" | "read")
              }
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading notifications...
            </p>
          ) : visibleNotifications.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">
              No notifications found.
            </p>
          ) : (
            <>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {visibleNotifications.map((notification) => {
                  const isUpdating = updatingId === notification.id;

                  return (
                    <article
                      key={notification.id}
                      className={`p-5 ${
                        notification.is_read
                          ? "bg-white dark:bg-zinc-900"
                          : "bg-red-50/60 dark:bg-red-950/20"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            {!notification.is_read && (
                              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-600" />
                            )}

                            <h2 className="text-lg font-bold">
                              {notification.title}
                            </h2>
                          </div>

                          <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-300">
                            {notification.message}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                            <span className="capitalize">
                              {notification.type || "general"}
                            </span>
                            <span>{formatDate(notification.created_at)}</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void toggleRead(notification)}
                            disabled={isUpdating}
                            className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold transition hover:border-red-600 hover:text-red-600 disabled:opacity-50 dark:border-zinc-700"
                          >
                            {notification.is_read
                              ? "Mark Unread"
                              : "Mark Read"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void deleteNotification(notification)
                            }
                            disabled={isUpdating}
                            className="rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:opacity-50 dark:border-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredNotifications.length
                  )}{" "}
                  of {filteredNotifications.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:opacity-40 dark:border-zinc-700"
                  >
                    Previous
                  </button>

                  <span className="px-2 text-sm font-semibold">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold disabled:opacity-40 dark:border-zinc-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
