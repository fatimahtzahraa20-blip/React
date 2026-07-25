import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import supabase from "../../lib/supabase";

type VideoRecord = {
  id: string | number;
  title: string | null;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  user_id: string | null;
  approval_status: "pending" | "approved" | "rejected" | string | null;
  created_at: string | null;
};

export default function Videos() {
  const { user, profile } = useAuth();

  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = profile?.role === "admin";

  const loadVideos = async () => {
    if (!user) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    let query = supabase
      .from("videos")
      .select(
        "id, title, description, video_url, thumbnail_url, user_id, approval_status, created_at"
      )
      .order("created_at", { ascending: false });

    if (!isAdmin) {
      query = query.eq("user_id", user.id);
    }

    const { data, error: videosError } = await query;

    if (videosError) {
      setError(videosError.message);
      setVideos([]);
    } else {
      setVideos((data ?? []) as VideoRecord[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadVideos();
  }, [user, isAdmin]);

  const filteredVideos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesSearch =
        !normalizedSearch ||
        (video.title ?? "").toLowerCase().includes(normalizedSearch) ||
        (video.description ?? "").toLowerCase().includes(normalizedSearch);

      const status = video.approval_status ?? "pending";
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [videos, search, statusFilter]);

  const totals = useMemo(() => {
    return videos.reduce(
      (result, video) => {
        const status = video.approval_status ?? "pending";

        result.total += 1;

        if (status === "approved") {
          result.approved += 1;
        } else if (status === "rejected") {
          result.rejected += 1;
        } else {
          result.pending += 1;
        }

        return result;
      },
      {
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
      }
    );
  }, [videos]);

  const deleteVideo = async (video: VideoRecord) => {
    const confirmed = window.confirm(
      `Delete "${video.title || "this video"}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(video.id);
    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("videos")
      .delete()
      .eq("id", video.id);

    setDeletingId(null);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setVideos((current) =>
      current.filter((item) => item.id !== video.id)
    );

    setMessage("Video deleted successfully.");
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
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 flex flex-col gap-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              {isAdmin ? "Admin Panel" : "User Dashboard"}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              {isAdmin ? "Video Management" : "My Videos"}
            </h1>

            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              {isAdmin
                ? "Review and manage all videos submitted to the portfolio."
                : "View, edit, and manage videos submitted from your account."}
            </p>
          </div>

          {(isAdmin || profile?.can_upload) && (
            <Link
              to={isAdmin ? "/admin/add-video" : "/dashboard/add-video"}
              className="inline-flex items-center justify-center rounded-lg bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              Add New Video
            </Link>
          )}
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Videos
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.total}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("approved")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Approved
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.approved}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pending
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.pending}</p>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("rejected")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Rejected
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.rejected}</p>
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

        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <button
              type="button"
              onClick={() => void loadVideos()}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:opacity-60 dark:border-zinc-700"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading videos...
            </p>
          ) : filteredVideos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 px-5 py-14 text-center dark:border-zinc-700">
              <h2 className="text-xl font-bold">No videos found</h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Try a different search or status filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredVideos.map((video) => {
                const status = video.approval_status ?? "pending";
                const editPath = isAdmin
                  ? `/admin/videos/${video.id}/edit`
                  : `/dashboard/videos/${video.id}/edit`;

                const statusClass =
                  status === "approved"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : status === "rejected"
                      ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
                      : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";

                return (
                  <article
                    key={video.id}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="aspect-video bg-zinc-200 dark:bg-zinc-800">
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt={video.title || "Video thumbnail"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                          No thumbnail
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="line-clamp-2 text-lg font-bold">
                          {video.title || "Untitled video"}
                        </h2>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusClass}`}
                        >
                          {status}
                        </span>
                      </div>

                      {video.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                          {video.description}
                        </p>
                      )}

                      <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                        Added: {formatDate(video.created_at)}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link
                          to={editPath}
                          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 dark:border-zinc-700"
                        >
                          Edit
                        </Link>

                        {video.video_url && (
                          <a
                            href={video.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 dark:border-zinc-700"
                          >
                            Open
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => void deleteVideo(video)}
                          disabled={deletingId === video.id}
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900"
                        >
                          {deletingId === video.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}