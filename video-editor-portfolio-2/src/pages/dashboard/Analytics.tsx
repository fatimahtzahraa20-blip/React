import { useEffect, useMemo, useState } from "react";

import supabase from "../../lib/supabase";

type MonthlyPoint = {
  month: string;
  users: number;
  videos: number;
  messages: number;
};

type ActivityItem = {
  id: string | number;
  action: string;
  entity_type: string | null;
  details: string | null;
  created_at: string | null;
};

type AnalyticsSummary = {
  totalUsers: number;
  approvedUsers: number;
  pendingUsers: number;
  totalVideos: number;
  approvedVideos: number;
  pendingVideos: number;
  rejectedVideos: number;
  totalMessages: number;
  unreadMessages: number;
};

const initialSummary: AnalyticsSummary = {
  totalUsers: 0,
  approvedUsers: 0,
  pendingUsers: 0,
  totalVideos: 0,
  approvedVideos: 0,
  pendingVideos: 0,
  rejectedVideos: 0,
  totalMessages: 0,
  unreadMessages: 0,
};

function getLastSixMonths() {
  const months: Array<{
    key: string;
    label: string;
  }> = [];

  const today = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - offset,
      1
    );

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: date.toLocaleDateString("en", {
        month: "short",
      }),
    });
  }

  return months;
}

export default function Analytics() {
  const [summary, setSummary] =
    useState<AnalyticsSummary>(initialSummary);
  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    const [
      usersResult,
      approvedUsersResult,
      pendingUsersResult,
      videosResult,
      approvedVideosResult,
      pendingVideosResult,
      rejectedVideosResult,
      messagesResult,
      unreadMessagesResult,
      userDatesResult,
      videoDatesResult,
      messageDatesResult,
      activityResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),

      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved"),

      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending"),

      supabase.from("videos").select("*", { count: "exact", head: true }),

      supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved"),

      supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending"),

      supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "rejected"),

      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true }),

      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),

      supabase.from("profiles").select("created_at"),

      supabase.from("videos").select("created_at"),

      supabase.from("contact_messages").select("created_at"),

      supabase
        .from("activity_logs")
        .select("id, action, entity_type, details, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const firstError =
      usersResult.error ||
      approvedUsersResult.error ||
      pendingUsersResult.error ||
      videosResult.error ||
      approvedVideosResult.error ||
      pendingVideosResult.error ||
      rejectedVideosResult.error ||
      messagesResult.error ||
      unreadMessagesResult.error ||
      userDatesResult.error ||
      videoDatesResult.error ||
      messageDatesResult.error ||
      activityResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setSummary({
      totalUsers: usersResult.count ?? 0,
      approvedUsers: approvedUsersResult.count ?? 0,
      pendingUsers: pendingUsersResult.count ?? 0,
      totalVideos: videosResult.count ?? 0,
      approvedVideos: approvedVideosResult.count ?? 0,
      pendingVideos: pendingVideosResult.count ?? 0,
      rejectedVideos: rejectedVideosResult.count ?? 0,
      totalMessages: messagesResult.count ?? 0,
      unreadMessages: unreadMessagesResult.count ?? 0,
    });

    const months = getLastSixMonths();

    const countByMonth = (
      rows: Array<{ created_at: string | null }>
    ) => {
      const counts = new Map<string, number>();

      rows.forEach((row) => {
        if (!row.created_at) {
          return;
        }

        const date = new Date(row.created_at);
        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        counts.set(key, (counts.get(key) ?? 0) + 1);
      });

      return counts;
    };

    const userCounts = countByMonth(
      (userDatesResult.data ?? []) as Array<{
        created_at: string | null;
      }>
    );

    const videoCounts = countByMonth(
      (videoDatesResult.data ?? []) as Array<{
        created_at: string | null;
      }>
    );

    const messageCounts = countByMonth(
      (messageDatesResult.data ?? []) as Array<{
        created_at: string | null;
      }>
    );

    setMonthlyData(
      months.map((month) => ({
        month: month.label,
        users: userCounts.get(month.key) ?? 0,
        videos: videoCounts.get(month.key) ?? 0,
        messages: messageCounts.get(month.key) ?? 0,
      }))
    );

    setRecentActivity(
      (activityResult.data ?? []) as ActivityItem[]
    );

    setLoading(false);
  };

  useEffect(() => {
    void loadAnalytics();
  }, []);

  const maximumMonthlyValue = useMemo(() => {
    const values = monthlyData.flatMap((item) => [
      item.users,
      item.videos,
      item.messages,
    ]);

    return Math.max(1, ...values);
  }, [monthlyData]);

  const videoApprovalRate = useMemo(() => {
    if (summary.totalVideos === 0) {
      return 0;
    }

    return Math.round(
      (summary.approvedVideos / summary.totalVideos) * 100
    );
  }, [summary]);

  const userApprovalRate = useMemo(() => {
    if (summary.totalUsers === 0) {
      return 0;
    }

    return Math.round(
      (summary.approvedUsers / summary.totalUsers) * 100
    );
  }, [summary]);

  const formatDate = (value: string | null) => {
    if (!value) {
      return "Not available";
    }

    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  };

  const summaryCards = [
    {
      label: "Total Users",
      value: summary.totalUsers,
      detail: `${summary.pendingUsers} pending`,
    },
    {
      label: "Approved Users",
      value: summary.approvedUsers,
      detail: `${userApprovalRate}% approval rate`,
    },
    {
      label: "Total Videos",
      value: summary.totalVideos,
      detail: `${summary.pendingVideos} pending review`,
    },
    {
      label: "Approved Videos",
      value: summary.approvedVideos,
      detail: `${videoApprovalRate}% approval rate`,
    },
    {
      label: "Rejected Videos",
      value: summary.rejectedVideos,
      detail: "Needs revision",
    },
    {
      label: "Messages",
      value: summary.totalMessages,
      detail: `${summary.unreadMessages} unread`,
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Admin Panel
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Analytics Dashboard
              </h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Review growth, approvals, messages, and recent system activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadAnalytics()}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
            >
              {loading ? "Refreshing..." : "Refresh Analytics"}
            </button>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : card.value}
              </p>

              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {card.detail}
              </p>
            </article>
          ))}
        </section>

        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <h2 className="text-2xl font-bold">
              Last Six Months
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Monthly users, videos, and contact messages.
            </p>
          </div>

          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading analytics...
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="mb-6 flex flex-wrap gap-5 text-sm">
                  <span className="font-semibold">
                    Users
                  </span>
                  <span className="font-semibold">
                    Videos
                  </span>
                  <span className="font-semibold">
                    Messages
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-5">
                  {monthlyData.map((point) => (
                    <div key={point.month}>
                      <div className="flex h-64 items-end justify-center gap-2 rounded-xl bg-zinc-50 px-3 pb-4 dark:bg-zinc-950">
                        <div
                          className="w-5 rounded-t bg-zinc-500"
                          style={{
                            height: `${Math.max(
                              6,
                              (point.users /
                                maximumMonthlyValue) *
                                210
                            )}px`,
                          }}
                          title={`${point.users} users`}
                        />

                        <div
                          className="w-5 rounded-t bg-red-600"
                          style={{
                            height: `${Math.max(
                              6,
                              (point.videos /
                                maximumMonthlyValue) *
                                210
                            )}px`,
                          }}
                          title={`${point.videos} videos`}
                        />

                        <div
                          className="w-5 rounded-t bg-zinc-800 dark:bg-white"
                          style={{
                            height: `${Math.max(
                              6,
                              (point.messages /
                                maximumMonthlyValue) *
                                210
                            )}px`,
                          }}
                          title={`${point.messages} messages`}
                        />
                      </div>

                      <div className="mt-3 text-center">
                        <p className="font-semibold">
                          {point.month}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {point.users} / {point.videos} /{" "}
                          {point.messages}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">
              Approval Overview
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    User approval rate
                  </span>
                  <span>{userApprovalRate}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full bg-red-600"
                    style={{
                      width: `${userApprovalRate}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold">
                    Video approval rate
                  </span>
                  <span>{videoApprovalRate}%</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                  <div
                    className="h-full bg-red-600"
                    style={{
                      width: `${videoApprovalRate}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Pending
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {summary.pendingVideos}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Approved
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {summary.approvedVideos}
                  </p>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Rejected
                  </p>
                  <p className="mt-2 text-2xl font-bold">
                    {summary.rejectedVideos}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">
              Recent Activity
            </h2>

            <div className="mt-6 space-y-4">
              {loading ? (
                <p className="py-8 text-center text-zinc-500">
                  Loading activity...
                </p>
              ) : recentActivity.length === 0 ? (
                <p className="py-8 text-center text-zinc-500">
                  No activity found.
                </p>
              ) : (
                recentActivity.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                        {item.action}
                      </span>

                      <span className="text-xs text-zinc-500">
                        {formatDate(item.created_at)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {item.details ||
                        `${item.entity_type || "System"} activity`}
                    </p>
                  </article>
                ))
              )}
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}