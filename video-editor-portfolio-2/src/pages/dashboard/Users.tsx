import { useEffect, useMemo, useState } from "react";

import supabase from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  role: "admin" | "user" | string;
  approval_status: "pending" | "approved" | "rejected" | string;
  can_upload: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

const PAGE_SIZE = 8;

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error: usersError } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, approval_status, can_upload, is_active, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (usersError) {
      setError(usersError.message);
      setUsers([]);
    } else {
      setUsers((data ?? []) as Profile[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, roleFilter]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        (user.full_name ?? "").toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        user.approval_status === statusFilter;

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, search, statusFilter, roleFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const totals = useMemo(() => {
    return users.reduce(
      (result, user) => {
        result.total += 1;

        if (user.role === "admin") {
          result.admins += 1;
        }

        if (user.approval_status === "pending") {
          result.pending += 1;
        }

        if (user.is_active) {
          result.active += 1;
        }

        return result;
      },
      {
        total: 0,
        admins: 0,
        pending: 0,
        active: 0,
      }
    );
  }, [users]);

  const updateUser = async (
    user: Profile,
    changes: Partial<
      Pick<
        Profile,
        "role" | "approval_status" | "can_upload" | "is_active"
      >
    >,
    successMessage: string
  ) => {
    setUpdatingId(user.id);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ...changes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateError) {
      setError(updateError.message);
      setUpdatingId("");
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.id === user.id
          ? {
              ...currentUser,
              ...changes,
              updated_at: new Date().toISOString(),
            }
          : currentUser
      )
    );

    setMessage(successMessage);
    setUpdatingId("");
  };

  const approveUser = async (user: Profile) => {
    await updateUser(
      user,
      {
        approval_status: "approved",
        is_active: true,
      },
      `${user.email} has been approved.`
    );
  };

  const rejectUser = async (user: Profile) => {
    await updateUser(
      user,
      {
        approval_status: "rejected",
        can_upload: false,
      },
      `${user.email} has been rejected.`
    );
  };

  const toggleUpload = async (user: Profile) => {
    const nextValue = !user.can_upload;

    await updateUser(
      user,
      {
        can_upload: nextValue,
      },
      `Upload permission ${nextValue ? "enabled" : "disabled"} for ${user.email}.`
    );
  };

  const toggleActive = async (user: Profile) => {
    const nextValue = !user.is_active;

    await updateUser(
      user,
      {
        is_active: nextValue,
        can_upload: nextValue ? user.can_upload : false,
      },
      `${user.email} has been ${nextValue ? "activated" : "disabled"}.`
    );
  };

  const toggleRole = async (user: Profile) => {
    const nextRole = user.role === "admin" ? "user" : "admin";

    await updateUser(
      user,
      {
        role: nextRole,
        approval_status:
          nextRole === "admin" ? "approved" : user.approval_status,
        is_active: nextRole === "admin" ? true : user.is_active,
        can_upload: nextRole === "admin" ? true : user.can_upload,
      },
      `${user.email} is now assigned the ${nextRole} role.`
    );
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
              <h1 className="text-3xl font-bold">User Management</h1>

              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                Search users, approve accounts, manage roles, and control access.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadUsers()}
              disabled={loading}
              className="rounded-lg border border-zinc-300 px-5 py-3 font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700"
            >
              {loading ? "Refreshing..." : "Refresh Users"}
            </button>
          </div>
        </section>

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setRoleFilter("all");
            }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Total Users
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.total}</p>
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
            onClick={() => setRoleFilter("admin")}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Administrators
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.admins}</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setStatusFilter("all");
              setRoleFilter("all");
            }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-red-500 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Active Accounts
            </p>
            <p className="mt-2 text-3xl font-bold">{totals.active}</p>
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
          <div className="grid gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800 md:grid-cols-[minmax(0,1fr)_190px_170px]">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none transition focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-red-600 dark:border-zinc-700 dark:bg-zinc-950"
            >
              <option value="all">All roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading registered users...
            </p>
          ) : paginatedUsers.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">
              No users match the current filters.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                  <thead className="bg-zinc-100 dark:bg-zinc-950">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Approval
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Upload
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {paginatedUsers.map((user) => {
                      const isUpdating = updatingId === user.id;

                      return (
                        <tr key={user.id}>
                          <td className="whitespace-nowrap px-5 py-4">
                            <p className="font-semibold">
                              {user.full_name || "Unnamed user"}
                            </p>
                            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              {user.email}
                            </p>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4">
                            <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                              {user.role}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold capitalize">
                            {user.approval_status}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm">
                            {user.can_upload ? "Enabled" : "Disabled"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm">
                            {user.is_active ? "Active" : "Disabled"}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                            {formatDate(user.created_at)}
                          </td>

                          <td className="min-w-[420px] px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => void approveUser(user)}
                                disabled={
                                  isUpdating ||
                                  user.approval_status === "approved"
                                }
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                onClick={() => void rejectUser(user)}
                                disabled={
                                  isUpdating ||
                                  user.approval_status === "rejected"
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>

                              <button
                                type="button"
                                onClick={() => void toggleUpload(user)}
                                disabled={isUpdating || !user.is_active}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                              >
                                {user.can_upload
                                  ? "Disable Upload"
                                  : "Enable Upload"}
                              </button>

                              <button
                                type="button"
                                onClick={() => void toggleRole(user)}
                                disabled={isUpdating}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                              >
                                {user.role === "admin"
                                  ? "Make User"
                                  : "Make Admin"}
                              </button>

                              <button
                                type="button"
                                onClick={() => void toggleActive(user)}
                                disabled={isUpdating}
                                className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700"
                              >
                                {user.is_active
                                  ? "Disable Account"
                                  : "Activate Account"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-zinc-200 p-5 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-
                  {Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} of{" "}
                  {filteredUsers.length}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
                  >
                    Previous
                  </button>

                  <span className="px-3 text-sm font-semibold">
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
                    className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold transition hover:border-red-600 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
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