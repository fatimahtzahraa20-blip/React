import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import supabase from "../../lib/supabase";

type DashboardStats = {
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

const initialStats: DashboardStats = {
  totalVideos: 0,
  pendingVideos: 0,
  approvedVideos: 0,
  totalCategories: 0,
  unreadMessages: 0,
};

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(initialStats);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    const results = await Promise.all([
      supabase.from("videos").select("*", { count: "exact", head: true }),
      supabase.from("videos").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
      supabase.from("videos").select("*", { count: "exact", head: true }).eq("approval_status", "approved"),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("contact_messages").select("*", { count: "exact", head: true }).eq("is_read", false),
      supabase.from("videos").select("id, title, approval_status, created_at").order("created_at", { ascending: false }).limit(6),
    ]);

    const firstError = results.find((result) => result.error)?.error;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    setStats({
      totalVideos: results[0].count ?? 0,
      pendingVideos: results[1].count ?? 0,
      approvedVideos: results[2].count ?? 0,
      totalCategories: results[3].count ?? 0,
      unreadMessages: results[4].count ?? 0,
    });
    setRecentVideos((results[5].data ?? []) as RecentVideo[]);
    setLoading(false);
  };

  useEffect(() => { void loadDashboard(); }, []);

  const cards = useMemo(() => [
    { label: "Total Videos", value: stats.totalVideos, to: "/admin/videos" },
    { label: "Pending Videos", value: stats.pendingVideos, to: "/admin/videos" },
    { label: "Published Videos", value: stats.approvedVideos, to: "/admin/videos" },
    { label: "Categories", value: stats.totalCategories, to: "/admin/categories" },
    { label: "Unread Messages", value: stats.unreadMessages, to: "/admin/messages" },
  ], [stats]);

  const formatDate = (value: string | null) => value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "Not available";

  return (
    <main className="min-h-screen bg-zinc-50 px-4 pb-16 pt-28 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">Owner Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Welcome, {profile?.full_name || user?.email || "Owner"}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Manage your personal portfolio and incoming project messages.</p>
          </div>
          <button type="button" onClick={() => void loadDashboard()} disabled={loading} className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:opacity-60 dark:border-zinc-700">
            {loading ? "Refreshing..." : "Refresh Dashboard"}
          </button>
        </section>

        {error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">{error}</div>}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => <Link key={card.label} to={card.to} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"><p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p><p className="mt-2 text-3xl font-bold">{loading ? "..." : card.value}</p></Link>)}
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4"><div><h2 className="text-2xl font-bold">Recent Videos</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Your latest portfolio uploads.</p></div><Link to="/admin/videos" className="text-sm font-semibold text-red-600 hover:text-red-700">View All</Link></div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {loading ? <p className="py-8 text-zinc-500">Loading videos...</p> : recentVideos.length === 0 ? <p className="py-8 text-zinc-500">No videos found.</p> : recentVideos.map((video) => <div key={video.id} className="flex items-center justify-between gap-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><div className="min-w-0"><p className="truncate font-semibold">{video.title || "Untitled video"}</p><p className="mt-1 text-xs text-zinc-500">{formatDate(video.created_at)}</p></div><span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">{video.approval_status || "draft"}</span></div>)}
          </div>
        </section>
      </div>
    </main>
  );
}
