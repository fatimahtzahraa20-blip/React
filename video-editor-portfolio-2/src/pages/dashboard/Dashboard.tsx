import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import supabase from "../../lib/supabase";

type DashboardStats = {
  totalUsers: number;
  pendingUsers: number;
  totalVideos: number;
  pendingVideos: number;
  approvedVideos: number;
  totalCategories: number;
  unreadMessages: number;
};

type RecentVideo = {
  id: string | number;
  title: string | null;
  approval_status: string | null;
  created_at: string | null;
};

type RecentUser = {
  id: string;
  full_name: string | null;
  email: string;
  approval_status: string;
  created_at: string | null;
};

const initialStats: DashboardStats = {
  totalUsers: 0,
  pendingUsers: 0,
  totalVideos: 0,
  pendingVideos: 0,
  approvedVideos: 0,
  totalCategories: 0,
  unreadMessages: 0,
};

export default function Dashboard() {
  const { user, profile } = useAuth();

  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const [
      usersResult,
      pendingUsersResult,
      videosResult,
      pendingVideosResult,
      approvedVideosResult,
      categoriesResult,
      unreadMessagesResult,
      recentVideosResult,
      recentUsersResult,
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending"),
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "pending"),
      supabase
        .from("videos")
        .select("*", { count: "exact", head: true })
        .eq("approval_status", "approved"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),
      supabase
        .from("videos")
        .select("id, title, approval_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("profiles")
        .select("id, full_name, email, approval_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const firstError =
      usersResult.error ||
      pendingUsersResult.error ||
      videosResult.error ||
      pendingVideosResult.error ||
      approvedVideosResult.error ||
      categoriesResult.error ||
      unreadMessagesResult.error ||
      recentVideosResult.error ||
      recentUsersResult.error;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setStats({
      totalUsers: usersResult.count ?? 0,
      pendingUsers: pendingUsersResult.count ?? 0,
      totalVideos: videosResult.count ?? 0,
      pendingVideos: pendingVideosResult.count ?? 0,
      approvedVideos: approvedVideosResult.count ?? 0,
      totalCategories: categoriesResult.count ?? 0,
      unreadMessages: unreadMessagesResult.count ?? 0,
    });

    setRecentVideos((recentVideosResult.data ?? []) as RecentVideo[]);
    setRecentUsers((recentUsersResult.data ?? []) as RecentUser[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        value: stats.totalUsers,
        to: "/admin/users",
      },
      {
        label: "Pending Users",
        value: stats.pendingUsers,
        to: "/admin/users",
      },
      {
        label: "Total Videos",
        value: stats.totalVideos,
        to: "/admin/videos",
      },
      {
        label: "Pending Videos",
        value: stats.pendingVideos,
        to: "/admin/videos",
      },
      {
        label: "Approved Videos",
        value: stats.approvedVideos,
        to: "/admin/videos",
      },
      {
        label: "Categories",
        value: stats.totalCategories,
        to: "/admin/categories",
      },
      {
        label: "Unread Messages",
        value: stats.unreadMessages,
        to: "/admin/messages",
      },
    ],
    [stats]
  );

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
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Welcome, {profile?.full_name || user?.email || "Administrator"}
            </h1>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              View current activity and manage your portfolio system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
          >
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.to}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-red-500 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {card.label}
              </p>

              <p className="mt-2 text-3xl font-bold">
                {loading ? "..." : card.value}
              </p>
            </Link>
          ))}
        </section>

        <section className="mb-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Recent Videos</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Latest video submissions.
                </p>
              </div>

              <Link
                to="/admin/videos"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <p className="py-8 text-center text-zinc-500">
                  Loading videos...
                </p>
              ) : recentVideos.length === 0 ? (
                <p className="py-8 text-center text-zinc-500">
                  No videos found.
                </p>
              ) : (
                recentVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {video.title || "Untitled video"}
                      </p>

                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(video.created_at)}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                      {video.approval_status || "pending"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">Recent Users</h2>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Latest registered accounts.
                </p>
              </div>

              <Link
                to="/admin/users"
                className="text-sm font-semibold text-red-600 hover:text-red-700"
              >
                View All
              </Link>
            </div>

            <div className="mt-6 space-y-3">
              {loading ? (
                <p className="py-8 text-center text-zinc-500">
                  Loading users...
                </p>
              ) : recentUsers.length === 0 ? (
                <p className="py-8 text-center text-zinc-500">
                  No users found.
                </p>
              ) : (
                recentUsers.map((recentUser) => (
                  <div
                    key={recentUser.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {recentUser.full_name || recentUser.email}
                      </p>

                      <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400">
                        {recentUser.email}
                      </p>
                    </div>

                    <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                      {recentUser.approval_status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          <Link
            to="/admin/users"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Manage Users</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Approve accounts, manage roles, and control upload access.
            </p>
          </Link>

          <Link
            to="/admin/videos"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Manage Videos</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Review, approve, edit, and remove video submissions.
            </p>
          </Link>

          <Link
            to="/admin/categories"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Categories</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Organize categories and subcategories.
            </p>
          </Link>

          <Link
            to="/admin/messages"
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="text-xl font-bold">Messages</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              Read and manage contact form messages.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}