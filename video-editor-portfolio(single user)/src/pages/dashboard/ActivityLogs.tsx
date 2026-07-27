import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import supabase from "../../lib/supabase";

type ActivityLog = {
  id: string | number;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: string | null;
};

type ProfileSummary = {
  id: string;
  full_name: string | null;
  email: string;
};

const PAGE_SIZE = 10;

export default function ActivityLogs() {
  const { profile } = useAuth();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [profiles, setProfiles] = useState<ProfileSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityFilter, setEntityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isAdmin = true;

  const loadData = async () => {
    setLoading(true);
    setError("");

    const [logsResult, profilesResult] = await Promise.all([
      supabase
        .from("activity_logs")
        .select(
          "id, user_id, action, entity_type, entity_id, details, created_at"
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, email"),
    ]);

    if (logsResult.error) {
      setError(logsResult.error.message);
      setLogs([]);
    } else {
      setLogs((logsResult.data ?? []) as ActivityLog[]);
    }

    if (profilesResult.error) {
      setError((current) =>
        current
          ? `${current} ${profilesResult.error?.message ?? ""}`
          : profilesResult.error?.message ?? ""
      );
      setProfiles([]);
    } else {
      setProfiles((profilesResult.data ?? []) as ProfileSummary[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, actionFilter, entityFilter]);

  const profileMap = useMemo(() => {
    return new Map(
      profiles.map((item) => [
        item.id,
        item.full_name || item.email,
      ])
    );
  }, [profiles]);

  const actionOptions = useMemo(
    () =>
      Array.from(
        new Set(logs.map((log) => log.action).filter(Boolean))
      ).sort(),
    [logs]
  );

  const entityOptions = useMemo(
    () =>
      Array.from(
        new Set(
          logs
            .map((log) => log.entity_type)
            .filter((value): value is string => Boolean(value))
        )
      ).sort(),
    [logs]
  );

  const filteredLogs = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return logs.filter((log) => {
      const actor = log.user_id
        ? profileMap.get(log.user_id) || log.user_id
        : "System";

      const matchesSearch =
        !normalizedSearch ||
        actor.toLowerCase().includes(normalizedSearch) ||
        log.action.toLowerCase().includes(normalizedSearch) ||
        (log.entity_type ?? "").toLowerCase().includes(normalizedSearch) ||
        (log.entity_id ?? "").toLowerCase().includes(normalizedSearch) ||
        (log.details ?? "").toLowerCase().includes(normalizedSearch);

      const matchesAction =
        actionFilter === "all" || log.action === actionFilter;

      const matchesEntity =
        entityFilter === "all" ||
        log.entity_type === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
  }, [logs, search, actionFilter, entityFilter, profileMap]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredLogs.length / PAGE_SIZE)
  );

  const visibleLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const clearLogs = async () => {
    if (!isAdmin) {
      return;
    }

    const confirmed = window.confirm(
      "Delete all activity logs? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setMessage("");
    setError("");

    const { error: deleteError } = await supabase
      .from("activity_logs")
      .delete()
      .neq("id", 0);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLogs([]);
    setMessage("All activity logs were cleared.");
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
        <section className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
            Admin Panel
          </p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Activity Logs</h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Review important account, video, category, and message actions.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={loading}
                className="rounded-lg border border-zinc-300 px-4 py-3 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 disabled:opacity-60 dark:border-zinc-700"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => void clearLogs()}
                disabled={!isAdmin || logs.length === 0}
                className="rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900"
              >
                Clear Logs
              </button>
            </div>
          </div>
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
          <div className="grid gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 md:grid-cols-[minmax(0,1fr)_200px_200px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search logs..."
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <select
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All actions</option>
              {actionOptions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            <select
              value={entityFilter}
              onChange={(event) => setEntityFilter(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All entity types</option>
              {entityOptions.map((entity) => (
                <option key={entity} value={entity}>
                  {entity}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading activity logs...
            </p>
          ) : visibleLogs.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">
              No activity logs found.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-100 dark:bg-zinc-950">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Actor
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Entity
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {visibleLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold">
                            {log.user_id
                              ? profileMap.get(log.user_id) || "Unknown user"
                              : "System"}
                          </p>

                          {log.user_id && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {log.user_id}
                            </p>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                            {log.action}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm">
                          <p className="capitalize">
                            {log.entity_type || "General"}
                          </p>
                          {log.entity_id && (
                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                              {log.entity_id}
                            </p>
                          )}
                        </td>

                        <td className="min-w-[280px] px-5 py-4 text-sm text-zinc-600 dark:text-zinc-300">
                          {log.details || "No additional details"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDate(log.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    filteredLogs.length
                  )}{" "}
                  of {filteredLogs.length}
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
