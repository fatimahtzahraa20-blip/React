import { useEffect, useState } from "react";

import supabase from "../lib/supabase";

type Profile = {
  email: string;
  role: "admin" | "user" | string;
  approval_status: "pending" | "approved" | "rejected" | string;
  can_upload: boolean;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingEmail, setUpdatingEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");

    const { data, error: usersError } = await supabase
      .from("profiles")
      .select(
        "email, role, approval_status, can_upload, is_active, created_at, updated_at"
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

  const updateUser = async (
    email: string,
    changes: Partial<
      Pick<
        Profile,
        "role" | "approval_status" | "can_upload" | "is_active"
      >
    >,
    successMessage: string
  ) => {
    setUpdatingEmail(email);
    setMessage("");
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        ...changes,
        updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    if (updateError) {
      setError(updateError.message);
      setUpdatingEmail("");
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.email === email
          ? {
              ...user,
              ...changes,
              updated_at: new Date().toISOString(),
            }
          : user
      )
    );

    setMessage(successMessage);
    setUpdatingEmail("");
  };

  const approveUser = async (user: Profile) => {
    await updateUser(
      user.email,
      {
        approval_status: "approved",
        is_active: true,
      },
      `${user.email} has been approved.`
    );
  };

  const rejectUser = async (user: Profile) => {
    await updateUser(
      user.email,
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
      user.email,
      {
        can_upload: nextValue,
      },
      `Upload permission ${nextValue ? "enabled" : "disabled"} for ${user.email}.`
    );
  };

  const toggleActive = async (user: Profile) => {
    const nextValue = !user.is_active;

    await updateUser(
      user.email,
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
      user.email,
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
                Approve accounts, manage roles, control upload permission, and
                enable or disable access.
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
          {loading ? (
            <p className="py-16 text-center text-zinc-500">
              Loading registered users...
            </p>
          ) : users.length === 0 ? (
            <p className="py-16 text-center text-zinc-500">
              No registered users were found.
            </p>
          ) : (
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
                  {users.map((user) => {
                    const isUpdating = updatingEmail === user.email;

                    return (
                      <tr key={user.email}>
                        <td className="whitespace-nowrap px-5 py-4">
                          <p className="font-semibold">{user.email}</p>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold capitalize dark:border-zinc-700">
                            {user.role}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span className="text-sm font-semibold capitalize">
                            {user.approval_status}
                          </span>
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
          )}
        </section>
      </div>
    </main>
  );
}